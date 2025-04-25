import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  FaPlusCircle, 
  FaRocket, 
  FaKey, 
  FaChartLine, 
  FaBook 
} from "react-icons/fa";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  href: string;
}

export default function QuickActions() {
  const actions: QuickAction[] = [
    {
      icon: <FaPlusCircle className="mr-3 text-primary-500" />,
      label: "Create new XP event type",
      href: "/xp-management/new"
    },
    {
      icon: <FaRocket className="mr-3 text-primary-500" />,
      label: "Launch new campaign",
      href: "/campaigns/new"
    },
    {
      icon: <FaKey className="mr-3 text-primary-500" />,
      label: "Generate API keys",
      href: "/sdk-config/api-keys"
    },
    {
      icon: <FaChartLine className="mr-3 text-primary-500" />,
      label: "View detailed analytics",
      href: "/analytics"
    },
    {
      icon: <FaBook className="mr-3 text-primary-500" />,
      label: "Access documentation",
      href: "/documentation"
    }
  ];

  return (
    <Card>
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-lg font-medium text-slate-900">Quick Actions</h3>
      </div>
      <div className="p-5">
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <a className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center text-sm font-medium text-slate-700 transition">
                {action.icon}
                {action.label}
              </a>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
}
