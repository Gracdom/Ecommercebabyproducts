import { Truck, Calendar } from 'lucide-react';

export function EstimatedDelivery() {
  // Calculate delivery date range (3-5 business days from now)
  const getDeliveryDates = () => {
    const today = new Date();
    const minDays = 3;
    const maxDays = 5;
    
    const addBusinessDays = (date: Date, days: number) => {
      const result = new Date(date);
      let addedDays = 0;
      
      while (addedDays < days) {
        result.setDate(result.getDate() + 1);
        // Skip weekends
        if (result.getDay() !== 0 && result.getDay() !== 6) {
          addedDays++;
        }
      }
      
      return result;
    };
    
    const minDate = addBusinessDays(today, minDays);
    const maxDate = addBusinessDays(today, maxDays);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long' 
      });
    };
    
    return {
      min: formatDate(minDate),
      max: formatDate(maxDate),
      minDate,
      maxDate,
    };
  };

  const delivery = getDeliveryDates();
  const today = new Date();
  const cutoffTime = 14; // 2 PM
  const currentHour = today.getHours();
  const canShipToday = currentHour < cutoffTime;

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="bg-white p-2 rounded-lg">
          <Truck className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm text-stone-900 mb-1">
            Entrega estimada
          </h3>
          <p className="text-lg text-emerald-700 mb-2">
            {delivery.min} - {delivery.max}
          </p>
          
          {canShipToday && (
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Calendar className="h-4 w-4" />
              <span>
                Pide en las próximas <strong>{cutoffTime - currentHour}h {60 - today.getMinutes()}m</strong> para envío hoy
              </span>
            </div>
          )}
          
          <p className="text-xs text-stone-600 mt-2">
            Envío gratis en pedidos superiores a €50
          </p>
        </div>
      </div>
    </div>
  );
}
