// src/pages/childpanel/ChildPanelNotifications.jsx
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";
import CpNotificationManager from "../../components/childpanel/notifications/CpNotificationManager";

export default function ChildPanelNotifications() {
  return (
    <ChildPanelLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <p className="text-sm text-gray-500">
          Send announcements to your users — choose your own signups, your resellers' end users, or everyone on your panel
        </p>
      </div>

      <CpNotificationManager />
    </ChildPanelLayout>
  );
}
