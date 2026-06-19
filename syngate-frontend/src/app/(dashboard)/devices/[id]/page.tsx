'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DeviceForm } from '@/components/devices/DeviceForm';
import { DevicesService } from '@/services/devices.service';

export default function EditarDispositivoPage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['device', id],
    queryFn: () => DevicesService.buscarPorId(id as string),
    enabled: !!id,
  });

  if (isLoading || !data) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#f47920]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Editar Dispositivo</h1>
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm min-h-[420px]">
        <DeviceForm initialData={data.data} />
      </div>
    </div>
  );
}