// src/templates/TemplateRouter.jsx
//
// Sits between App.jsx routes and the actual page components.
// On a child panel domain with a templateId set, it renders
// the template version of the page. Otherwise it renders the
// default page component passed as `defaultPage`.
//
// USAGE in App.jsx:
//
//   import TemplateRouter from "./templates/TemplateRouter";
//   import Home from "./pages/Home";
//
//   <Route
//     path="/home"
//     element={
//       <ProtectedRoute>
//         <TemplateRouter page="home" defaultPage={<Home />} />
//       </ProtectedRoute>
//     }
//   />
//
// The templateId is read from ChildPanelContext (branding fetch).
// On the main platform or a reseller domain, defaultPage always renders.

import { useCachedServices } from "../context/CachedServicesContext";
import { useChildPanel } from "../context/ChildPanelContext";
import { getTemplatePage } from "./registry";

export default function TemplateRouter({ page, defaultPage }) {
  const { domainType } = useCachedServices();
  const { childPanel } = useChildPanel();

  // Only apply templates on child panel domains
  if (domainType !== "childPanel" || !childPanel) {
    return defaultPage;
  }

  const templateId = childPanel.templateId;
  if (!templateId) return defaultPage;

  const TemplatePage = getTemplatePage(templateId, page);
  if (!TemplatePage) return defaultPage;

  return <TemplatePage />;
}
