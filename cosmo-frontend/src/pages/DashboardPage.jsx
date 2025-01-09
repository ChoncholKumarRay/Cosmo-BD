import React, { useState, useEffect } from "react";
import "./styles/DashboardPage.css";

const DashboardPage = () => {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupplies = async () => {
      try {
        const token = localStorage.getItem("cosmobd-admin-token"); // Assumes login stores token
        const response = await fetch(
          "http://localhost:5002/api/admin/get-supply",
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
                {supply.current_status?.message || "Pending"}
              </p>
              <div className="action-row">
                <select className="status-dropdown">
                  <option value="acknowledge">Acknowledge</option>
                  <option value="packaged">Packaged</option>
                  <option value="delivered">Delivered</option>
                </select>
                <button className="update-button">Update Status</button>
              </div>
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
