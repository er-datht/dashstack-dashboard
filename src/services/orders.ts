/**
 * Orders API Service
 * Handles all order-related API calls and mock data
 */

import type { OrderListItem } from "../types/orders";

const MOCK_ORDERS: OrderListItem[] = [
  { id: "00001", name: "John Doe", address: "123 Main St", date: "2024-10-15", type: "electronics", status: "completed" },
  { id: "00002", name: "Jane Smith", address: "456 Oak Ave", date: "2024-10-16", type: "fashion_beauty", status: "processing" },
  { id: "00003", name: "Mike Johnson", address: "789 Pine Rd", date: "2024-10-17", type: "health_medicine", status: "rejected" },
  { id: "00004", name: "Sarah Williams", address: "321 Elm St", date: "2024-10-18", type: "book_stationary", status: "on_hold" },
  { id: "00005", name: "David Brown", address: "654 Maple Dr", date: "2024-10-19", type: "services_industry", status: "completed" },
  { id: "00006", name: "Emily Davis", address: "987 Cedar Ln", date: "2024-10-20", type: "home_living", status: "processing" },
  { id: "00007", name: "James Wilson", address: "147 Birch Ct", date: "2024-10-21", type: "mobile_phone", status: "completed" },
  { id: "00008", name: "Lisa Anderson", address: "258 Walnut St", date: "2024-10-22", type: "accessories", status: "rejected" },
  { id: "00009", name: "Robert Taylor", address: "369 Cherry Way", date: "2024-10-23", type: "electronics", status: "on_hold" },
  { id: "00010", name: "Amanda Martinez", address: "741 Spruce Ave", date: "2024-10-24", type: "fashion_beauty", status: "completed" },
  { id: "00011", name: "Chris Lee", address: "852 Aspen Blvd", date: "2024-10-25", type: "health_medicine", status: "processing" },
  { id: "00012", name: "Jessica Thomas", address: "963 Willow Dr", date: "2024-10-26", type: "book_stationary", status: "completed" },
  { id: "00013", name: "Daniel Harris", address: "159 Poplar St", date: "2024-10-27", type: "services_industry", status: "rejected" },
  { id: "00014", name: "Michelle Clark", address: "267 Redwood Ln", date: "2024-10-28", type: "home_living", status: "on_hold" },
  { id: "00015", name: "Kevin Lewis", address: "378 Sequoia Ct", date: "2024-10-29", type: "mobile_phone", status: "completed" },
  { id: "00016", name: "Rachel Walker", address: "489 Magnolia Ave", date: "2024-10-30", type: "accessories", status: "processing" },
  { id: "00017", name: "Andrew Hall", address: "591 Cypress Dr", date: "2024-10-31", type: "electronics", status: "completed" },
  { id: "00018", name: "Nicole Allen", address: "602 Hickory St", date: "2024-11-01", type: "fashion_beauty", status: "rejected" },
  { id: "00019", name: "Brandon Young", address: "713 Dogwood Ln", date: "2024-11-02", type: "health_medicine", status: "on_hold" },
  { id: "00020", name: "Stephanie King", address: "824 Juniper Ct", date: "2024-11-03", type: "book_stationary", status: "completed" },
  { id: "00021", name: "Jason Wright", address: "935 Sycamore Ave", date: "2024-11-04", type: "services_industry", status: "processing" },
  { id: "00022", name: "Laura Scott", address: "146 Beech Dr", date: "2024-11-05", type: "home_living", status: "completed" },
  { id: "00023", name: "Ryan Green", address: "257 Chestnut St", date: "2024-11-06", type: "mobile_phone", status: "rejected" },
  { id: "00024", name: "Megan Adams", address: "368 Hawthorn Ln", date: "2024-11-07", type: "accessories", status: "on_hold" },
  { id: "00025", name: "Tyler Baker", address: "479 Oakwood Ct", date: "2024-11-08", type: "electronics", status: "completed" },
  { id: "00026", name: "Ashley Nelson", address: "580 Pinecrest Ave", date: "2024-11-09", type: "fashion_beauty", status: "processing" },
  { id: "00027", name: "Joshua Carter", address: "691 Linden Dr", date: "2024-11-10", type: "health_medicine", status: "completed" },
];

export const getOrders = async (): Promise<OrderListItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_ORDERS;
};
