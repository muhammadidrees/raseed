import { AppTheme } from "@/app/components/AppTheme";
import App from "../app";

export default function LegacyContractorPage() {
  return (
    <AppTheme>
      <App
        exportFileLabel="Invoice"
        organizationDisplayName=""
        storageNamespace={undefined}
      />
    </AppTheme>
  );
}
