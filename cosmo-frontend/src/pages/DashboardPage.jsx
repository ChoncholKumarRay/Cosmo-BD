import React, { useState, useEffect } from "react";
import "./styles/DashboardPage.css";

const DashboardPage = () => {
  const [supplies, setSupplies] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseMessages, setResponseMessages] = useState({});
  const [disabledButtons, setDisabledButtons] = useState({});
  const [currentStatus, setCurrentStatus] = useState("");

  useEffect(() => {
    const fetchSupplies = async () => {
      try {
        const token = localStorage.getItem("cosmobd-admin-token");
        const response = await fetch(
          "https://cosmo.cam-sust.org/api/admin/get-supply",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch supplies. Please check your access."
          );
        }

        const data = await response.json();
        setSupplies(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplies();
  }, []);

  const handleUpdateStatus = async (supplyId, status) => {
    try {
      setDisabledButtons((prev) => ({ ...prev, [supplyId]: true })); // Disable the button
      const token = localStorage.getItem("cosmobd-admin-token");
      const response = await fetch(
        "https://cosmo-bd.onrender.com/api/admin/update-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ supplyId, status }),
        }
      );

      const data = await response.json();
      setResponseMessages((prev) => ({
        ...prev,
        [supplyId]: data.message || "Status updated successfully.",
      }));

      setCurrentStatus(status);
    } catch (error) {
      setResponseMessages((prev) => ({
        ...prev,
        [supplyId]: "Failed to update status. Please try again.",
      }));
    } finally {
      setDisabledButtons((prev) => ({ ...prev, [supplyId]: false })); // Re-enable the button
    }
  };

  const handleStatusChange = (supplyId, newStatus) => {
    setStatuses((prev) => ({ ...prev, [supplyId]: newStatus }));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard">
      <h1>Supply Dashboard</h1>
      <div className="supply-container">
        {supplies.map((supply) => (
          <div className="supply-card" key={supply._id}>
            <div className="left-section">
              <p>
                <strong>Supply ID:</strong> {supply.supply_id}
              </p>
              <p>
                <strong>Buyer Name:</strong> {supply.buyer_name}
              </p>
              <p>
                <strong>Phone:</strong> {supply.phone}
              </p>
              <p>
                <strong>Address:</strong> {supply.address}
              </p>
              <p>
                <strong>Payment:</strong> {supply.payment}
              </p>
              <p>
                <strong>Bank Transaction:</strong> {supply.bank_transaction}
              </p>
              <p>
                <strong>Current Status:</strong>{" "}
                {currentStatus !== "" ? currentStatus : supply.current_status}
              </p>
              <div className="action-row">
                <select
                  className="status-dropdown"
                  value={statuses[supply.supply_id] || ""}
                  onChange={(e) =>
                    handleStatusChange(supply.supply_id, e.target.value)
                  }
                >
                  <option value="">Select Status</option>
                  <option value="Acknowledged">Acknowledged</option>
                  <option value="Packaged">Packaged</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <button
                  className="update-button"
                  onClick={() =>
                    handleUpdateStatus(
                      supply.supply_id,
                      statuses[supply.supply_id]
                    )
                  }
                  disabled={
                    disabledButtons[supply.supply_id] ||
                    !statuses[supply.supply_id]
                  }
                >
                  {disabledButtons[supply.supply_id]
                    ? "Updating..."
                    : "Update Status"}
                </button>
              </div>
              {responseMessages[supply.supply_id] && (
                <p className="response-message">
                  {responseMessages[supply.supply_id]}
                </p>
              )}
            </div>
            <div className="right-section">
              <h3>Ordered Products</h3>
              {supply.enriched_products.map((product, index) => (
                <div key={index} className="product-item">
                  <p>
                    <strong>Product Name:</strong> {product.name}
                  </p>
                  <p>
                    <strong>Price:</strong> ${product.price}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {product.quantity}
                  </p>
                  <p>
                    <strong>Subtotal:</strong> ${product.subtotal_price}
                  </p>
                </div>
              ))}
              <p className="total-price">
                <strong>Total Price:</strong> ${supply.total_price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
