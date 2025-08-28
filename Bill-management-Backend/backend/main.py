from fastapi import FastAPI, Depends, HTTPException, Body, Query, WebSocket, WebSocketDisconnect
import bcrypt
from database.models import User, BillInfo, Notification
from sqlalchemy import select
from backend.schemas import CreateUser, LoginUser, UserBillInfo, UpdateBill, ConnectionManager
from sqlalchemy.orm import Session
from backend.dependencies import get_db
from backend.utils import create_access_token, get_user_id_from_token
from datetime import timedelta, datetime, timezone
from calendar import monthrange
import pytz
from fastapi.responses import JSONResponse, HTMLResponse
import asyncio

app = FastAPI()
manager = ConnectionManager()

def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')

@app.get("/")
def read_root():
    return {"message": "Hello World!"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}

@app.post("/create-user")
def create_user(signupuser: CreateUser, db: Session = Depends(get_db)):
    stmt = select(User).where(User.email == signupuser.email)
    result = db.execute(stmt).scalar_one_or_none()
    if result:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = hash_password(signupuser.password)
    new_user = User(
        fullname=signupuser.fullname,
        phone=signupuser.phone,
        email=signupuser.email,
        password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user_id": str(new_user.id)}

@app.post("/login")
def login_user(user: LoginUser, db: Session = Depends(get_db)):
    stmt = select(User).where(User.email == user.email)
    db_user = db.execute(stmt).scalar_one_or_none()

    if not db_user or not bcrypt.checkpw(user.password.encode('utf-8'), db_user.password.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(db_user.id)}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "message": "Login successful"
    }

@app.post("/add-bill")
def add_bill(billinfo: UserBillInfo, db: Session = Depends(get_db), user_id: str = Depends(get_user_id_from_token)):
    new_bill = BillInfo(
        title=billinfo.title,
        description=billinfo.description,
        due_date=billinfo.due_date,
        amount=billinfo.amount,
        reminder_time=billinfo.reminder_time,
        status='unpaid',
        user_id=user_id
    )
    db.add(new_bill)
    db.commit()
    db.refresh(new_bill)

    return {"message": "Bill added successfully", "bill_id": str(new_bill.id)}

@app.get("/bills")
def get_bills(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token),
    month: int = Query(None, ge=1, le=12),
    year: int = Query(None, ge=1900)
):
    stmt = select(BillInfo).where(BillInfo.user_id == user_id)

    if month and year:
        nepal_tz = timezone(timedelta(hours=5, minutes=45))
        start_date = datetime(year, month, 1, tzinfo=nepal_tz)
        last_day = monthrange(year, month)[1]
        end_date = datetime(year, month, last_day, 23, 59, 59, 999999, tzinfo=nepal_tz)
        stmt = stmt.where(
            BillInfo.created_at >= start_date,
            BillInfo.created_at <= end_date
        )

    bills = db.execute(stmt).scalars().all()

    if not bills:
        return JSONResponse(status_code=200, content={"message": "No bill info"})

    return [
        {
            "id": str(bill.id),
            "title": bill.title,
            "description": bill.description,
            "due_date": bill.due_date,
            "amount": bill.amount,
            "reminder_time": bill.reminder_time,
            "status": bill.status,
            "created_at": bill.created_at,
        }
        for bill in bills
    ]

@app.patch("/update-bill/{bill_id}")
def update_bill(
    bill_id: str,
    updated_data: UpdateBill = Body(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token)
):
    stmt = select(BillInfo).where(BillInfo.id == bill_id, BillInfo.user_id == user_id)
    bill = db.execute(stmt).scalar_one_or_none()

    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    if updated_data.status and updated_data.status not in ['paid', 'unpaid']:
        raise HTTPException(status_code=400, detail="Invalid status value")

    for field, value in updated_data.dict(exclude_unset=True).items():
        setattr(bill, field, value)

    db.commit()
    db.refresh(bill)

    return {
        "message": "Bill updated successfully",
        "bill_id": str(bill.id),
        "updated_fields": updated_data.dict(exclude_unset=True)
    }

@app.delete("/delete-bill/{bill_id}")
def delete_bill(
    bill_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token)
):
    stmt = select(BillInfo).where(BillInfo.id == bill_id, BillInfo.user_id == user_id)
    bill = db.execute(stmt).scalar_one_or_none()

    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    db.delete(bill)
    db.commit()

    return {"message": "Bill deleted successfully", "bill_id": bill_id}

async def check_and_add_notifications(db: Session):
    current_date = datetime.now(pytz.timezone('Asia/Kathmandu')).date()
    reminder_days_map = {
        '7_days_ago': 7,
        '3_days_ago': 3,
        'deadline_day': 0
    }

    print(f"Checking notifications at {datetime.now()} for date: {current_date}")

    bills_query = select(BillInfo).where(BillInfo.status == 'unpaid')
    bills = db.execute(bills_query).scalars().all()

    notifications_added = []

    for bill in bills:
        print(f"Bill {bill.id}: title='{bill.title}', due_date={bill.due_date}, reminder_time={bill.reminder_time}, status={bill.status}")
        days_before_due = reminder_days_map.get(bill.reminder_time)
        if days_before_due is None:
            print(f"Skipping bill {bill.id} due to unknown reminder_time: {bill.reminder_time}")
            continue

        due_date_local = bill.due_date
        if hasattr(due_date_local, 'tzinfo') and due_date_local.tzinfo is not None:
            due_date_local = due_date_local.astimezone(pytz.timezone('Asia/Kathmandu')).date()
        else:
            due_date_local = due_date_local.date()

        reminder_date = due_date_local - timedelta(days=days_before_due)
        print(f"Calculated reminder_date for bill {bill.id} is {reminder_date}")

        if reminder_date == current_date:
            message = f"Reminder: Your bill '{bill.title}' of amount {bill.amount} is due on {due_date_local}."

            # Check for existing notification by user_id and bill_id
            existing_notification = db.query(Notification).filter_by(
                user_id=bill.user_id,
                bill_id=bill.id,
                message=message
            ).first()

            print(f"Existing notification: {existing_notification}")

            if not existing_notification:
                print(f"Adding notification for user {bill.user_id}: {message}")
                new_notification = Notification(
                    message=message,
                    user_id=bill.user_id,
                    bill_id=bill.id  # Store the bill id here
                )
                db.add(new_notification)
                db.commit()
                db.refresh(new_notification)
                notifications_added.append((bill.user_id, message))
            else:
                print(f"Notification already exists for bill {bill.id} and user {bill.user_id}")
        else:
            print(f"No notification for bill {bill.id} today.")

    # Send notifications via WebSocket
    for user_id, msg in notifications_added:
        await manager.send_personal_message(user_id, msg)


async def notification_loop():
    while True:
        try:
            db = next(get_db())
            await check_and_add_notifications(db)
            db.close()
        except Exception as e:
            print(f"Error in notification loop: {e}")
        await asyncio.sleep(3600)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(notification_loop())

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep connection open
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)

@app.get("/notifications/{user_id}", response_class=HTMLResponse)
async def notifications_page(user_id: str):
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Notifications for User {user_id}</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            #notifications {{ border: 1px solid #ccc; padding: 10px; max-width: 500px; }}
            .notification {{ background: #eef; margin: 5px 0; padding: 8px; border-radius: 4px; }}
        </style>
    </head>
    <body>
        <h2>Notifications for User {user_id}</h2>
        <div id="notifications">
            <em>No notifications yet.</em>
        </div>

        <script>
            const notificationsDiv = document.getElementById("notifications");
            const ws = new WebSocket("ws://" + window.location.host + "/ws/{user_id}");
            ws.onmessage = function(event) {{
                const msg = document.createElement("div");
                msg.className = "notification";
                msg.textContent = event.data;
                notificationsDiv.prepend(msg);
            }};
            ws.onopen = function() {{
                console.log("WebSocket connected");
            }};
            ws.onclose = function() {{
                console.log("WebSocket disconnected");
            }};
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@app.get("/test-notifications")
async def test_notifications(db: Session = Depends(get_db)):
    await check_and_add_notifications(db)
    return {"message": "Notifications checked manually"}

