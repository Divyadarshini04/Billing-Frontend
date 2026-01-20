import { useEffect, useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { NotificationContext } from "../context/NotificationContext";

export default function NotificationBootstrap() {
  const { userRole } = useAuth();
  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {
    if (userRole !== "ADMIN") return;

    try {
      const saved = localStorage.getItem("customers");
      const customers = saved ? JSON.parse(saved) : [];
      const notifiedKey = "notified_due_customer_ids";
      const already = JSON.parse(localStorage.getItem(notifiedKey) || "[]");
      const newNotified = [...already];

      customers.forEach((c) => {
        if (!c) return;
        const pendingRaw = c.pendingAmount || c.pending || "0";
        const digits = ("" + pendingRaw).replace(/[^0-9.-]/g, "");
        const pending = parseFloat(digits) || 0;
        if (pending > 0 && !already.includes(c.id)) {
          addNotification("product", "Customer Due", `${c.name} has a pending amount of ${c.pendingAmount || c.pending || "₹" + pending}`);
          newNotified.push(c.id);
        }
      });

      if (newNotified.length !== already.length) {
        localStorage.setItem(notifiedKey, JSON.stringify(newNotified));
      }
    } catch (err) {
      // silent
    }
  }, [userRole, addNotification]);

  return null;
}
