from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, List
from datetime import datetime, date
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket):
        self.active_connections[user_id].remove(websocket)
        if not self.active_connections[user_id]:
            del self.active_connections[user_id]

    async def send_personal_message(self, user_id: str, message: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_text(message)

manager = ConnectionManager()

class CreateUser(BaseModel):
    fullname : str
    phone : str
    email : EmailStr
    password : str

class LoginUser(BaseModel):
    email : EmailStr
    password : str

class UserBillInfo(BaseModel):
    title: str
    description: str = None
    due_date: date
    amount: float
    reminder_time: str  # '7_days_ago', '3_days_ago', 'deadline_day'

class UpdateBill(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    amount: Optional[float] = None
    reminder_time: Optional[str] = None
    status: Optional[str] = None

    class Config:
        orm_mode = True

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str