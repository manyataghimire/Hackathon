import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";
import * as Notifications from "expo-notifications";

interface Bill {
  id: string;
  name: string;
  amount: string;
  dueDate: string;
  reminder: string;
  description: string; // ✅ Added description
}

const BillManagement = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [billName, setBillName] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billDueDate, setBillDueDate] = useState("");
  const [billReminder, setBillReminder] = useState("");
  const [billDescription, setBillDescription] = useState(""); // ✅ new

  // Request notification permissions
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  const scheduleNotification = async (bill: Bill, daysBefore: number) => {
    const due = new Date(bill.dueDate);
    const notifyDate = new Date(due);
    notifyDate.setDate(due.getDate() - daysBefore);

    if (notifyDate > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Bill Reminder",
          body: `${bill.name} is due on ${bill.dueDate}.`,
        },
        trigger: notifyDate,
      });
    }
  };

  const addBill = () => {
    if (!billName || !billAmount || !billDueDate) return;

    const newBill: Bill = {
      id: Date.now().toString(),
      name: billName,
      amount: billAmount,
      dueDate: billDueDate,
      reminder: billReminder,
      description: billDescription,
    };

    setBills([...bills, newBill]);

    // Schedule reminders
    scheduleNotification(newBill, 1); // 1 day before
    scheduleNotification(newBill, 7); // 1 week before

    // reset fields
    setBillName("");
    setBillAmount("");
    setBillDueDate("");
    setBillReminder("");
    setBillDescription("");
    setModalVisible(false);
  };

  // Test notification
  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test notification!",
      },
      trigger: null,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bill Management</Text>

      {/* Bill List */}
      <FlatList
        data={bills}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.billItem}>
            <Text style={styles.billText}>
              {item.name} - Rs.{item.amount} - Due: {item.dueDate}
            </Text>
            {item.description ? (
              <Text style={styles.descText}>{item.description}</Text>
            ) : null}
          </View>
        )}
      />

      {/* Add Bill Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Bill</Text>
      </TouchableOpacity>

      {/* Send Test Notification */}
      <TouchableOpacity
        style={styles.testButton}
        onPress={sendTestNotification}
      >
        <Text style={styles.testButtonText}>Send Test Notification</Text>
      </TouchableOpacity>

      {/* Modal for Adding Bill */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Bill Name"
              value={billName}
              onChangeText={setBillName}
              style={styles.input}
            />
            <TextInput
              placeholder="Amount"
              keyboardType="numeric"
              value={billAmount}
              onChangeText={setBillAmount}
              style={styles.input}
            />
            <TextInput
              placeholder="Due Date (YYYY-MM-DD)"
              value={billDueDate}
              onChangeText={setBillDueDate}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={billDescription}
              onChangeText={setBillDescription}
              style={[styles.input, { height: 70 }]} // ✅ multiline
              multiline
            />
            <TextInput
              placeholder="Reminder"
              value={billReminder}
              onChangeText={setBillReminder}
              style={styles.input}
            />

            <TouchableOpacity style={styles.saveButton} onPress={addBill}>
              <Text style={styles.saveButtonText}>Save Bill</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BillManagement;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f2f6fc" },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#4e73df",
  },
  billItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  billText: { fontSize: 16, fontWeight: "600", color: "#333" },
  descText: { fontSize: 14, color: "gray", fontStyle: "italic", marginTop: 5 },
  addButton: {
    backgroundColor: "#4e73df",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  testButton: {
    backgroundColor: "#36b9cc",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  testButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: "#1cc88a",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  saveButtonText: { color: "#fff", fontWeight: "bold" },
  cancelButton: {
    backgroundColor: "#e74a3b",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: { color: "#fff", fontWeight: "bold" },
});
