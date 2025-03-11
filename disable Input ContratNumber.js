// tant que les trois champs (product, year et month) ne sont pas remplis. le le champ de saisie contractNumber est desactive

import { useState, useEffect } from "react";
          
          const MyComponent = () => {
            const [product, setProduct] = useState("");
            const [year, setYear] = useState("");
            const [month, setMonth] = useState("");
            const [contractNumber, setContractNumber] = useState("");
            const [isContractNumberDisabled, setIsContractNumberDisabled] = useState(true);
          
            // Check if all fields are filled
            useEffect(() => {
              if (product && year && month) {
                setIsContractNumberDisabled(false);
              } else {
                setIsContractNumberDisabled(true);
                setContractNumber(""); // Clear contractNumber if disabled
              }
            }, [product, year, month]);
          
            return (
              <div>
                <input
                  type="text"
                  placeholder="Product"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Contract Number"
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  disabled={isContractNumberDisabled}
                />
              </div>
            );
          };
          
          export default MyComponent;
