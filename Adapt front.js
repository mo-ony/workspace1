h### 🔹 **Adapting Your Frontend: Convert PDF to Base64 & Adjust `requestData`**  

Since the backend expects **PDF files as Base64 strings**, we need to **convert each file's blob to Base64** before sending the request.

---

### **📌 Step 1: Convert Blob (PDF) to Base64**
We can use the `FileReader` API to convert the **PDF files** to **Base64** format.

#### ✅ **Modify Your Code:**
```javascript
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // Convert to Base64
    reader.onload = () => resolve(reader.result.split(",")[1]); // Remove metadata prefix
    reader.onerror = (error) => reject(error);
  });
};

const prepareRequestData = async (files, commonData, contractNumbers, metadata) => {
  const requests = await Promise.all(
    files.map(async (file) => {
      const base64File = await convertFileToBase64(file.blob);
      return {
        contratBase64: base64File, // Base64 of PDF
        numPolice: contractNumbers[file.name] || null,
        nom: metadata[file.name]?.nom || "",
        prenom: metadata[file.name]?.prenom || "",
        njf: metadata[file.name]?.njf || "",
        annee: commonData.year,
        mois: commonData.month,
        produitId: commonData.product,
        archivePar: "CurrentUser", // Replace with actual user ID
        montantAssure: metadata[file.name]?.montantAssure || null,
        montantPrime: metadata[file.name]?.montantPrime || null,
      };
    })
  );
  
  return requests;
};

// Example Usage:
prepareRequestData(files, commonData, contractNumbers, metadata).then((requestData) => {
  console.log(requestData); // Send requestData in your API call
});
```

---

### **📌 Step 2: Send Data to Backend**
Once we have the **array of JSON objects**, send it to the backend via `fetch` or `axios`.

```javascript
axios.post("/api/archive/save", requestData)
  .then(response => console.log("Data saved successfully:", response))
  .catch(error => console.error("Error saving data:", error));
```

---

### **✅ What This Fixes**
✔ Converts **PDF files** to **Base64**  
✔ Adjusts **keys** to match the **backend DTO**  
✔ Handles **multiple files at once**  

Let me know if you need further refinements! 🚀
