import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // dropdown

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [billName, setBillName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [reminder, setReminder] = useState("1"); // default 1 day

  const handleSave = () => {
    Alert.alert("Bill Saved", `Bill: ${billName}, Reminder: ${reminder} day(s) before`);
    setModalVisible(false);
  };

  const sendTestNotification = () => {
    Alert.alert("Test Notification", "This is a test reminder notification!");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Bill Management</Text>

      <View style={styles.buttonGroup}>
        {/* Add Bill Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>+ Add Bill</Text>
        </TouchableOpacity>

        {/* Send Test Notification Button */}
        <TouchableOpacity style={styles.testButton} onPress={sendTestNotification}>
          <Text style={styles.buttonText}>Send Test Notification</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Add Bill */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Bill Name"
              value={billName}
              onChangeText={setBillName}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <TextInput
              style={styles.input}
              placeholder="Due Date (YYYY-MM-DD)"
              value={dueDate}
              onChangeText={setDueDate}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
            />

            {/* Reminder Dropdown */}
            <View style={styles.pickerContainer}>
              <Picker selectedValue={reminder} onValueChange={(val) => setReminder(val)}>
                <Picker.Item label="1 day before" value="1" />
                <Picker.Item label="2 days before" value="2" />
                <Picker.Item label="3 days before" value="3" />
                <Picker.Item label="4 days before" value="4" />
                <Picker.Item label="5 days before" value="5" />
                <Picker.Item label="6 days before" value="6" />
                <Picker.Item label="1 week before" value="7" />
              </Picker>
            </View>

            {/* Buttons */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Save Bill</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f6ff", // light blue
    paddingTop: 60, // header spacing
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b6ef5",
    textAlign: "center",
    marginBottom: 40,
  },
  buttonGroup: {
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    backgroundColor: "#4a6cf7",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  testButton: {
    backgroundColor: "#22b8cf",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: "90%",
    borderRadius: 10,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
});
