// import DashBoardSidebar from "../../Components/UserProfileSidebar/DashBoardSidebar";
import InnerBanner from "../../Components/InnerBanner/InnerBanner";
import NavBar from "../../Components/NavBar/NavBar";
import OrdersTable from "../../Components/OrdersTable/OrdersTable";
import Topheader from "../../Components/TopHeader/TopHeader";
import ProfileInfoSection from "../../Components/ProfileInfoSection/ProfileInfoSection";
import WishlistSection from "../../Components/WishlistSection/WishlistSection";
import './UserProfileWrapper.css';
import DashAddressList from "../../Components/DashAddressList/DashAddressList";
import PaymentMethods from "../../Components/PaymentMethods/PaymentMethods";
import UserProfileSidebar from "../../Components/UserProfileSidebar/UserProfileSidebar";
import { Outlet } from "react-router-dom";
import Footer from "../../Components/Footer/Footer";

export default function UserProfileWrapper() {

  return (
    <>
      <div className="user-profile-main-container">
        <Topheader />
        <NavBar />
        <div className="user-profile-wrapper-container">
          {/* <InnerBanner /> */}
          <div className="wrapper">
            <div className="user-profile-content-wrapper">
              <UserProfileSidebar />
              {/* <PaymentMethods/> */}
              {/* <DashAddressList/>
              <ProfileInfoSection/>
              <OrdersTable/>
              <WishlistSection/>
               <DashAddressList/> */}
               <Outlet/>
            </div>
          </div>
        </div>
        <Footer/>
      </div>
    </>
  )
}
