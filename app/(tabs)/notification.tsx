import { Picker } from "@react-native-picker/picker"; // dropdown
import { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Dummy notification data with money
const notifications = [
  { id: "1", title: "Rent", daysLeft: "3 days left", deadline: "2025-08-05", money: "Rs.1200" },
  { id: "2", title: "Electricity Bill", daysLeft: "3 days left", deadline: "2025-08-10", money: "Rs.450" },
  { id: "3", title: "Internet", daysLeft: "3 days left", deadline: "2025-08-07", money: "Rs.800" },
  { id: "4", title: "Water Bill", daysLeft: "5 days left", deadline: "2025-09-15", money: "Rs.300" },
];

export default function NotificationsScreen() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState("08"); // default August

  // Filter notifications by year & month
  const filteredNotifications = notifications.filter((item) => {
    const [year, month] = item.deadline.split("-"); // "2025-08-05"
    return year === selectedYear && month === selectedMonth;
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.daysLeft}</Text>
      <Text style={styles.label}>
        Deadline: <Text style={styles.deadline}>{item.deadline}</Text>
      </Text>
      <Text style={styles.label}>
        Amount: <Text style={styles.deadline}>{item.money}</Text>
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Notifications</Text>

      {/* Year & Month Dropdowns */}
      <View style={styles.filterRow}>
        <View style={styles.pickerBox}>
          <Text style={styles.filterLabel}>Year</Text>
          <Picker
            selectedValue={selectedYear}
            onValueChange={(value) => setSelectedYear(value)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="2024" value="2024" />
            <Picker.Item label="2025" value="2025" />
            <Picker.Item label="2026" value="2026" />
          </Picker>
        </View>

        <View style={styles.pickerBox}>
          <Text style={styles.filterLabel}>Month</Text>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(value) => setSelectedMonth(value)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="January" value="01" />
            <Picker.Item label="February" value="02" />
            <Picker.Item label="March" value="03" />
            <Picker.Item label="April" value="04" />
            <Picker.Item label="May" value="05" />
            <Picker.Item label="June" value="06" />
            <Picker.Item label="July" value="07" />
            <Picker.Item label="August" value="08" />
            <Picker.Item label="September" value="09" />
            <Picker.Item label="October" value="10" />
            <Picker.Item label="November" value="11" />
            <Picker.Item label="December" value="12" />
          </Picker>
        </View>
      </View>

      {/* Show current selection clearly */}
      <Text style={styles.selectedText}>
        Showing: {selectedMonth}-{selectedYear}
      </Text>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notifications found.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  pickerBox: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 5,
    elevation: 2,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  pickerItem: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
  selectedText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
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
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "gray",
    marginTop: 4,
  },
  label: {
    marginTop: 6,
    fontSize: 14,
    color: "#444",
  },
  deadline: {
    fontWeight: "600",
    color: "#111",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
});
