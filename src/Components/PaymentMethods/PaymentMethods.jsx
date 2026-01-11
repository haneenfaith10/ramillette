import React, { useState } from 'react';
import './PaymentMethods.css'; // Styles below.
import { FiEdit2, FiTrash } from 'react-icons/fi';
import cardvisa from '../../assets/images/card-master.png'
import cardvisa2 from '../../assets/images/card-visa.png'


const initialMethods = [
  { id: 1, type: 'Visa', last4: '4999', name: 'Susan Gardner', expiry: '08 / 2019', logo: '/visa.png' },
  { id: 2, type: 'MasterCard', last4: '0015', name: 'Susan Gardner', expiry: '11 / 2021', logo: '/mastercard.png' },
  { id: 3, type: 'PayPal', last4: '', name: '-', expiry: '-', logo: '/paypal.png' },
  { id: 4, type: 'Visa', last4: '6073', name: 'Susan Gardner', expiry: '09 / 2021', logo: '/visa.png' },
  { id: 5, type: 'Visa', last4: '9791', name: 'Susan Gardner', expiry: '05 / 2021', logo: '/visa.png' },
];

const PaymentMethods = () => {
  const [methods, setMethods] = useState(initialMethods);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);

  const openModal = (method = null) => {
    setEditingMethod(method);
    setModalOpen(true);
  };

  const deleteMethod = (id) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="payment-methods">
      <h3>Your credit / debit cards</h3>
      <div className="method-header">
        <span>Card</span>
        <span>Name on card</span>
        <span>Expires on</span>
        <span></span>
      </div>
      {methods.map((method) => (
        <div className="method-row" key={method.id}>
          <div className="card-info">
            <img src={cardvisa} alt={method.type} />
            <strong>{method.type}</strong> ending in {method.last4}
          </div>
          <span>{method.name}</span>
          <span>{method.expiry}</span>
          <div className="actions">
            <FiEdit2 onClick={() => openModal(method)} className="icon edit" />
            <FiTrash onClick={() => deleteMethod(method.id)} className="icon delete" />
          </div>
        </div>
      ))}

      <button className="payment-add-btn" onClick={() => openModal()}>Add payment method</button>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingMethod ? 'Edit payment method' : 'Add a payment method'}</h3>
              <button className="close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="option">
                <input type="radio" name="method" /> <img src={cardvisa} alt="PayPal" />
              </div>
              <div className="option">
                <input type="radio" name="method" /> 
                <img src={cardvisa2} alt="Visa" />
                <img src={cardvisa} alt="Amex" />
                <img src={cardvisa} alt="MasterCard" />
                <img src={cardvisa2} alt="Discover" />
              </div>
              <div className="input-group">
                <input type="text" placeholder="Card Number" />
                <input type="text" placeholder="Full Name" />
              </div>
              <div className="input-group">
                <input type="text" placeholder="MM/YY" />
                <input type="text" placeholder="CVC" />
              </div>
              <button className="register-btn">Register this card</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
