import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from "@components/security/ProtectedRoute.jsx";

import GuestHome from "./pages/customer/GuestHome.jsx";
import StaffLogin from "./pages/staff/StaffLogin.jsx";
import ManagerDashboard from "./pages/staff/ManagerDashboard.jsx";
import StaffManagement from "./pages/staff/StaffManagement.jsx";
import ServiceManagement from "./pages/staff/ServiceManagement.jsx";

import ScheduleManagement from "./pages/staff/ScheduleManagement.jsx";
import ScheduleDetail from "@components/feature/schedule/ScheduleDetail.jsx";

import Home from "./pages/customer/Home.jsx";
import Login from "./pages/customer/Login.jsx";
import Register from "./pages/customer/Register.jsx";
import NotFoundPage from "./pages/customer/NotFoundPage.jsx";

import ViewScheduleRequest from "./pages/staff/ViewScheduleRequest.jsx";
import RoomTypeManagement from "./pages/staff/RoomTypeManagement.jsx";
import CheckInManagement from "./pages/staff/CheckInManagement.jsx";
import CheckOutManagement from "./pages/staff/CheckOutManagement.jsx";
import RegisterWalkIn from "./pages/staff/RegisterWalkIn.jsx";
import RoomForBook from "./pages/staff/RoomForBook.jsx";

import ReceptionistBooking from "./pages/staff/ReceptionistBooking.jsx";
import BookingPayment from "./pages/staff/BookingPayment.jsx";
import RequestService from "./pages/staff/RequestService.jsx";
import AssignedServices from "./pages/staff/AssignedServices.jsx";

import HousekeepingTask from "./pages/staff/HousekeepingTask.jsx";

import RoomManagement from "./pages/staff/RoomManagement.jsx";
import BookingManagement from "./pages/staff/BookingManagement.jsx";
import BookingDetailAdmin from "./pages/staff/BookingDetailAdmin.jsx";

import ProfilePage from "./pages/customer/ProfilePage.jsx";
import ChangePasswordPage from "./pages/customer/ChangePasswordPage.jsx";
import BookRoom from "./pages/customer/BookRoom.jsx";
import SearchRoomPage from './pages/customer/SearchRoomPage.jsx';
import RoomDetail from './pages/customer/RoomDetail.jsx';
import ServiceDetail from './pages/customer/ServiceDetail.jsx';
import MyBookingsPage from "./pages/customer/MyBookingsPage.jsx";

import MySchedule from "./pages/staff/MySchedule.jsx";
import Settings from "./pages/staff/Settings.jsx";
import ServicesPage from "./pages/customer/Services.jsx";
import RoomsPage from "./pages/customer/Rooms.jsx";
import CustomerManagement from "./pages/staff/CustomerManagement.jsx";
import BookingDetail from "./pages/customer/BookingDetail.jsx";

import AllFeedbacks from "./pages/customer/AllFeedbacks.jsx";
import ChatBotWrapper from "./components/chatbot/ChatBotWrapper.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" reverseOrder={false} />
            <ChatBotWrapper />

            <Routes>

                <Route path="/" element={<GuestHome />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/staff/login" element={<StaffLogin />} />
                <Route path="/404" element={<NotFoundPage />} />

                <Route path="/home" element={<Home />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
                <Route path="/my-booking" element={<StaffLogin />} />

                <Route path="/services" element={<ServicesPage />} />
                <Route path="/service-detail" element={<ServiceDetail />} />


                <Route path="/search" element={<SearchRoomPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/booking-detail/:bookingId" element={<BookingDetail />} />
                <Route path="/feedbacks" element={<AllFeedbacks />} />

                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/room-detail" element={<RoomDetail />} />
                <Route path="/book-room" element={<BookRoom />} />

                {/** Staff Side */}

                <Route path="/staff/booking" element={
                    <ProtectedRoute allowedRoles={["manager", "admin", "receptionist"]}>
                        <ReceptionistBooking />
                    </ProtectedRoute>
                } />
                <Route path="/staff/booking/payment" element={
                    <ProtectedRoute allowedRoles={["manager", "admin", "receptionist"]}>
                        <BookingPayment />
                    </ProtectedRoute>
                } />

                <Route path="/staff/schedules/schedule-request" element={
                    <ProtectedRoute allowedRoles={["manager", "admin", "receptionist"]}>
                        <ViewScheduleRequest />
                    </ProtectedRoute>
                } />

                <Route path="/staff/schedules" element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                        <ScheduleManagement />
                    </ProtectedRoute>
                } />
                <Route path="/staff/schedules/detail" element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                        <ScheduleDetail />
                    </ProtectedRoute>
                } />

                <Route path="/staff/dashboard" element={
                    <ProtectedRoute allowedRoles={["manager", "admin"]}>
                        <ManagerDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/staff/housekeeping" element={
                    <ProtectedRoute allowedRoles={["housekeeper"]}>
                        <HousekeepingTask />
                    </ProtectedRoute>
                } />
                <Route path="/staff/services" element={
                    <ProtectedRoute allowedRoles={["manager", "admin", "receptionist"]}>
                        <ServiceManagement />
                    </ProtectedRoute>
                } />
                <Route path="/staff/staffs" element={
                    <ProtectedRoute allowedRoles={["manager", "admin", "receptionist"]}>
                        <StaffManagement />
                    </ProtectedRoute>
                } />
                <Route path="/staff/my-schedule" element={
                    <ProtectedRoute allowedRoles={["housekeeper", "service staff", "receptionist"]}>
                        <MySchedule />
                    </ProtectedRoute>
                } />
                <Route path="/staff/check-in" element={
                    <ProtectedRoute allowedRoles={["manager", "admin", "receptionist"]}>
                        <CheckInManagement />
                    </ProtectedRoute>
                } />
                <Route path="/staff/check-out" element={
                    <ProtectedRoute allowedRoles={["manager", "admin", "receptionist"]}>
                        <CheckOutManagement />
                    </ProtectedRoute>
                } />
                <Route path="/staff/customers" element={
                    <ProtectedRoute allowedRoles={["manager", "admin", "receptionist"]}>
                        <CustomerManagement />
                    </ProtectedRoute>
                } />
                <Route path="/staff/bookings" element={
                    <ProtectedRoute allowedRoles={["manager", "admin", "receptionist"]}>
                        <BookingManagement />
                    </ProtectedRoute>
                } />
                <Route path="/staff/bookings/detail/:bookingId" element={
                    <ProtectedRoute allowedRoles={["manager", "admin", "receptionist"]}>
                        <BookingDetailAdmin />
                    </ProtectedRoute>
                } />

                <Route path="/staff/register-walk-in" element={
                    <ProtectedRoute allowedRoles={["manager", "admin", "receptionist"]}>
                        <RegisterWalkIn />
                    </ProtectedRoute>
                } />
                <Route path="/staff/rooms-for-book" element={
                    <ProtectedRoute allowedRoles={["manager", "admin", "receptionist"]}>
                        <RoomForBook />
                    </ProtectedRoute>
                } />
                <Route path="/staff/request-service" element={
                    <ProtectedRoute allowedRoles={["manager", "admin", "receptionist"]}>
                        <RequestService />
                    </ProtectedRoute>
                } />

                <Route path="/staff/assigned-services" element={
                    <ProtectedRoute allowedRoles={["service staff"]}>
                        <AssignedServices />
                    </ProtectedRoute>
                } />

                <Route path="/staff/rooms" element={
                    <ProtectedRoute allowedRoles={["manager", "admin"]}>
                        <RoomManagement />
                    </ProtectedRoute>
                } />
                <Route path="/staff/roomtypes" element={
                    <ProtectedRoute allowedRoles={["manager", "admin"]}>
                        <RoomTypeManagement />
                    </ProtectedRoute>
                } />

                <Route path="/staff/settings" element={
                    <ProtectedRoute allowedRoles={["manager", "admin"]}>
                        <Settings />
                    </ProtectedRoute>
                } />

            </Routes>

        </BrowserRouter>
    );
}
