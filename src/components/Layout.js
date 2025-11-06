import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function Layout({
  children,
  ac1, ac2, ac3, ac4, ac5, ac6, ac7, ac8, ac9, ac10
}) {
  const menuItems = [
    { active: ac1, RName: "Dashboard", RLink: "/admin/dashboard", icon: "fas fa-tachometer-alt" },
    { active: ac2, RName: "Manage Company", RLink: "/admin/companys/list", icon: "fas fa-building" },
    { active: ac3, RName: "Manage User", RLink: "/admin/userlist", icon: "fas fa-users" },
    { active: ac4, RName: "Manage Location", RLink: "/admin/location", icon: "fas fa-map-marker-alt"},
    { active: ac5, RName: "Manage Job", RLink: "/admin/joblist", icon: "fas fa-briefcase" },
    { active: ac6, RName: "Reports", RLink: "/admin/report", icon: "fas fa-chart-line" },
    { active: ac7, RName: "Mails", RLink: "/admin/mails", icon: "fas fa-envelope" },
    { active: ac8, RName: "Feed Back", RLink: "/admin/feedbacklist", icon: "fas fa-comments" },
    { active: ac9, RName: "Manage Team", RLink: "/admin/team/list", icon: "fas fa-user-friends" },
    { active: ac9, RName: "chat", RLink: "/admin/chat", icon: "fas fa-user-friends" },

    { active: ac10, RName: "Logout", RLink: "/admin/login", icon: "fas fa-sign-out-alt" , onClick: () => {
      // call logout  clear local storage
      localStorage.clear();
      window.location.href = "/admin/login";
    } },
  ];

  return (
    <div>
      <Header />
      <div>
        <Sidebar menuItems={menuItems} />
        <div className="content-wrapper">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
