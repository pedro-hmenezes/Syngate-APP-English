import { DeviceForm } from '@/components/devices/DeviceForm';

export default function NovoDispositivoPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Cadastrar Dispositivo</h1>
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm min-h-[420px]">
        <DeviceForm />
      </div>
    </div>
  );
}