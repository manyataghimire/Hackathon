import React, { useState } from "react";
import { Button, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function ProfileScreen() {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      alert("⚠️ Password should be at least 6 characters");
      return;
    }
    alert("✅ Password changed successfully!");
    setNewPassword("");
    setConfirmPassword("");
    setShowChangePassword(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👤 Profile</Text>

      {/* Profile Info */}
      <View style={styles.card}>
        <Text style={styles.label}>Full Name:</Text>
        <Text style={styles.value}>Ram</Text>

        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>9844000223</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>khwopa@example.com</Text>

        <Text style={styles.label}>Password:</Text>
        <Text style={styles.value}>********</Text>
      </View>

      {/* Change Password Button */}
      <Button title="Change Password" onPress={() => setShowChangePassword(true)} />

      {/* Password Change Modal */}
      <Modal visible={showChangePassword} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Change Password</Text>
            <TextInput
              placeholder="New Password"
              secureTextEntry
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              placeholder="Confirm Password"
              secureTextEntry
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Button title="Update Password" onPress={handleChangePassword} />
            <Pressable
              onPress={() => setShowChangePassword(false)}
              style={{ marginTop: 10 }}
            >
              <Text style={{ color: "red", textAlign: "center" }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },
  header: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  label: { fontSize: 16, fontWeight: "600", color: "gray", marginTop: 10 },
  value: { fontSize: 18, marginBottom: 10 },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalHeader: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
});