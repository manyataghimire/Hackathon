import { Picker } from "@react-native-picker/picker";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 🔔 Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface Bill {
  id: string;
  name: string;
  amount: string;
  dueDate: string;
  reminder: string;
}

export default function HomeScreen() { 
  const [bills, setBills] = useState<Bill[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [billName, setBillName] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billDueDate, setBillDueDate] = useState("");
  const [billReminder, setBillReminder] = useState("1 day before");

  // ✅ Ask for notification permission when app starts
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Enable notifications to get reminders.");
      }
    })();
  }, []);

  // ✅ Schedule reminder based on due date & reminder option
  async function scheduleBillReminder(billName: string, billDate: string, reminder: string) {
    let dueDate = new Date(billDate);
    if (isNaN(dueDate.getTime())) return;

    switch (reminder) {
      case "2 days before":
        dueDate.setDate(dueDate.getDate() - 2);
        break;
      case "1 week before":
        dueDate.setDate(dueDate.getDate() - 7);
        break;
      case "1 day before":
        dueDate.setDate(dueDate.getDate() - 1);
        break;
    }

    if (dueDate > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Bill Reminder",
          body: `Rs.{billName} is due soon! (Rs.{reminder})`,
        },
        trigger: { date: dueDate }, // ✅ Correct
      });
    }
  }

  // ✅ Add new bill
  function addBill() {
    if (!billName || !billAmount || !billDueDate) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const newBill: Bill = {
      id: Date.now().toString(),
      name: billName,
      amount: billAmount,
      dueDate: billDueDate,
      reminder: billReminder,
    };

    setBills([...bills, newBill]);
    scheduleBillReminder(billName, billDueDate, billReminder);
    setModalVisible(false);
    setBillName("");
    setBillAmount("");
    setBillDueDate("");
    setBillReminder("1 day before");
  }

  // ✅ Delete bill
  function deleteBill(id: string) {
    setBills(bills.filter((bill) => bill.id !== id));
  }

  // ✅ Test notification after 5 sec
  async function sendTestNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test notification (works in 5 sec).",
      },
      trigger: { seconds: 5 },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Bill Reminder</Text>

      <FlatList
        data={bills}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.billItem}>
            <Text style={styles.billText}>
              {item.name} - Rs.{item.amount} - Due: {item.dueDate}
            </Text>
            <TouchableOpacity onPress={() => deleteBill(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
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

      {/* 🔔 Test Notification Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: "#ff9800" }]}
        onPress={sendTestNotification}
      >
        <Text style={styles.addButtonText}>Send Test Notification</Text>
      </TouchableOpacity>

      {/* Modal for adding bill */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <TextInput
            placeholder="Bill Name"
            value={billName}
            onChangeText={setBillName}
            style={styles.input}
          />
          <TextInput
            placeholder="Amount"
            value={billAmount}
            onChangeText={setBillAmount}
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Due Date (YYYY-MM-DD)"
            value={billDueDate}
            onChangeText={setBillDueDate}
            style={styles.input}
          />

          <Picker
            selectedValue={billReminder}
            onValueChange={(itemValue) => setBillReminder(itemValue)}
            style={styles.input}
          >
            <Picker.Item label="1 day before" value="1 day before" />
            <Picker.Item label="2 days before" value="2 days before" />
            <Picker.Item label="1 week before" value="1 week before" />
          </Picker>

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
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  billItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  billText: { fontSize: 16 },
  deleteText: { color: "red", fontWeight: "bold" },
  addButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalContent: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelButton: {
    backgroundColor: "#f44336",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
