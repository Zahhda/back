import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  Building,
  CreditCard,
  FileText,
  BarChart2,
  Settings,
  Shield,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Link } from 'react-router-dom';

// Extend DashboardSummary with roles
type DashboardSummary = {
  totalUsers: number;
  totalProperties: number;
  totalPayments: number;
  totalRoles?: number;
  totalReviews?: number;
  analyticsCount?: number;
};

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  link: string;
  count?: number;
  placeholder?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon,
  color,
  link,
  count,
  placeholder
}) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="hover:shadow-md transition-all hover:border-primary/20"
  >
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
        <div className={`${color} p-2 rounded-lg`}>{icon}</div>
      </CardHeader>

      <CardContent>
        {count !== undefined ? (
          <p className="text-3xl font-bold mb-2">{count.toLocaleString()}</p>
        ) : placeholder ? (
          <p className="text-xl font-medium text-muted-foreground mb-2">{placeholder}</p>
        ) : (
          <div className="h-9 mb-2" aria-hidden="true"></div>
        )}
        <CardDescription>{description}</CardDescription>
      </CardContent>

      <CardFooter>
        <Link to={link} className="w-full">
          <Button variant="outline" className="px-6">
            View {title}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  </motion.div>
);

const SimpleAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const token = (user as any).token ?? localStorage.getItem('token');
  const [stats, setStats] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchSummary = async () => {
      try {
        const response = await fetch('https://dorpay.in/api/dashboard/summary', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        const apiData: any = await response.json();
        console.log('Dashboard summary raw:', apiData);

        // Map server fields to our summary shape
        const mapped: DashboardSummary = {
          totalUsers: apiData.users ?? apiData.totalUsers ?? apiData.total_users ?? 0,
          totalProperties: apiData.properties ?? apiData.totalProperties ?? apiData.total_properties ?? 0,
          totalPayments: apiData.totalPayments ?? apiData.total_payments ?? 0,
          totalRoles: apiData.roles ?? apiData.totalRoles ?? apiData.total_roles ?? 0,
          totalReviews: apiData.totalReviews ?? apiData.total_reviews,
          analyticsCount: apiData.analyticsCount ?? apiData.analytics_count
        };
        setStats(mapped);
      } catch (error) {
        console.error('Fetch summary failed:', error);
      }
    };

    fetchSummary();
  }, [token]);

  if (!stats) return <div className="text-center py-10">Loading dashboard...</div>;

  const dashboardCards: DashboardCardProps[] = [
    { title: 'Users', description: 'Manage system users, roles and permissions', icon: <Users className="h-5 w-5 text-white" />, color: 'bg-blue-500', link: '/admin/users', count: stats.totalUsers },
    { title: 'Properties', description: 'Review and manage property listings', icon: <Building className="h-5 w-5 text-white" />, color: 'bg-emerald-500', link: '/admin/property-management', count: stats.totalProperties },
    { title: 'Roles', description: 'Configure system roles and access controls', icon: <Shield className="h-5 w-5 text-white" />, color: 'bg-indigo-500', link: '/admin/roles', count: stats.totalRoles, placeholder: 'Access Control' }
  ];

  return (
    <div>
      <ThemeProvider defaultTheme="dark">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
          {dashboardCards.map((card, i) => <DashboardCard key={i} {...card} />)}
        </div>

        <div className="mt-8">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {[
                  { action: 'New user registered', time: '10 minutes ago', user: 'Rahul Sharma' },
                  { action: 'Property listing approved', time: '1 hour ago', user: 'Admin' },
                  { action: 'Payment received', time: '3 hours ago', user: 'Priya Patel' },
                  { action: 'New review submitted', time: '5 hours ago', user: 'Vikram Singh' },
                  { action: 'System setting updated', time: '1 day ago', user: 'Admin' }
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-0 py-3 px-4 md:px-6"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm md:text-base truncate">{activity.action}</p>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">By {activity.user}</p>
                    </div>
                    <span className="text-xs md:text-sm text-muted-foreground md:ml-6 md:whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-center border-t">
              <Button variant="ghost" className="text-primary w-full md:w-auto">View All Activity</Button>
            </CardFooter>
          </Card>
        </div>

      </ThemeProvider>
    </div>
  );
};

export default SimpleAdminDashboard;
