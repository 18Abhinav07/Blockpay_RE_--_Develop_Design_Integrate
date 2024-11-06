import "./App.css";
import Company from "./Components/company.jsx";
import CompanyTransaction from "./Components/companyTransaction.jsx";
import Employee from "./Components/employee.jsx";
import User from "./Components/user.jsx";
import UserTransaction from "./Components/userTransaction.jsx";

function App() {
  return (
    <>
      <Company />
      <CompanyTransaction />
      <Employee />
      <User />
      <UserTransaction />
    </>
  );
}

export default App;
