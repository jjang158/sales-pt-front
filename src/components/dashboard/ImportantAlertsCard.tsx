import React from 'react';
import { CheckSquare, Cake, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface Alert {
  id: string;
  type: string;
  title: string;
  description: string;
  customerId?: string;
  badgeText: string;
  iconColor: string;
  badgeColor: string;
}

interface ImportantAlertsCardProps {
  alerts: Alert[];
  onSelectCustomer: (customerId: string) => void;
}

export function ImportantAlertsCard({ alerts, onSelectCustomer }: ImportantAlertsCardProps) {
  const getAlertIcon = (type: string, iconColor: string) => {
    switch (type) {
      case 'birthday':
        return <Cake className={`w-4 h-4 ${iconColor}`} />;
      case 'follow-up':
        return <Clock className={`w-4 h-4 ${iconColor}`} />;
      default:
        return <CheckSquare className={`w-4 h-4 ${iconColor}`} />;
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'birthday':
        return 'bg-pink-100 dark:bg-pink-900/50';
      case 'follow-up':
        return 'bg-orange-100 dark:bg-orange-900/50';
      default:
        return 'bg-gray-100 dark:bg-gray-900/50';
    }
  };

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          중요 알림
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => alert.customerId && onSelectCustomer(alert.customerId)}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getIconBgColor(alert.type)}`}>
              {getAlertIcon(alert.type, alert.iconColor)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{alert.title}</p>
              <p className="text-xs text-muted-foreground">{alert.description}</p>
            </div>
            <Badge variant="outline" className={`text-xs ${alert.badgeColor}`}>
              {alert.badgeText}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}