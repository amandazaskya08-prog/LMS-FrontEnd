import ModulePage from "../../../components/ui/module-page";
import { payments } from "../../../src/data/mock-data";
import { CreditCard } from "lucide-react";
import { formatCurrency } from "../../../src/lib/utils";

export default function UKTPage() {
  return (
    <ModulePage
      title="UKT Payments"
      description="View your tuition bills and payment history."
      icon={CreditCard}
      items={payments.map((payment) => ({
        title: payment.semester,
        description: formatCurrency(payment.amount),
        detail: `${payment.status.toUpperCase()} · Due ${payment.dueDate}`,
      }))}
    />
  );
}