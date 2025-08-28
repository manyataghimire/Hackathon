import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";

type BillType = {
  id: string;
  name: string;
  amount: string;
};

// Initial bill types
const initialBillTypes: BillType[] = [
  { id: "1", name: "Water Bill", amount: "50" },
  { id: "2", name: "Electricity Bill", amount: "120" },
  { id: "3", name: "Internet Bill", amount: "35" },
];

export default function BillsScreen() {
  const [billTypes, setBillTypes] = useState(initialBillTypes);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [newBillName, setNewBillName] = useState("");
  const [newBillAmount, setNewBillAmount] = useState("");

  const addBillType = () => {
    if (!newBillName || !newBillAmount) return;

    const newBill: BillType = {
      id: (billTypes.length + 1).toString(),
      name: newBillName,
      amount: newBillAmount,
    };

    setBillTypes([...billTypes, newBill]);
    setModalVisible(false);
    setNewBillName("");
    setNewBillAmount("");
  };

  const renderItem = ({ item }: { item: BillType }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.amount}>Amount: ${item.amount}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Bills</Text>

      <FlatList
        data={billTypes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>＋ Add</Text>
      </TouchableOpacity>

      {/* Modal to Add New Bill */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add New Bill</Text>

            <TextInput
              placeholder="Bill Name"
              value={newBillName}
              onChangeText={setNewBillName}
              style={styles.input}
            />
            <TextInput
              placeholder="Amount"
              value={newBillAmount}
              onChangeText={setNewBillAmount}
              style={styles.input}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addBillType}>
                <Text style={styles.saveText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fc", padding: 20 },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  card: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  amount: { fontSize: 16, color: "gray", marginTop: 4 },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#007bff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
  },
  addButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    elevation: 10,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  cancelButton: { padding: 10 },
  cancelText: { fontSize: 16, color: "red" },
  saveButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveText: { fontSize: 16, color: "white", fontWeight: "bold" },
});