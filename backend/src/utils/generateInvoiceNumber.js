const generateInvoiceNumber = () => {

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `INV-${Date.now()}-${random}`;
};

export default generateInvoiceNumber;