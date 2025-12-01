'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Plus, X } from 'lucide-react';

interface BeneficiariesFormProps {
  beneficiaries: Array<{
    name: string;
    relationship: string;
    share: string;
  }>;
  onChange: (beneficiaries: Array<{
    name: string;
    relationship: string;
    share: string;
  }>) => void;
}

export function BeneficiariesForm({ beneficiaries, onChange }: BeneficiariesFormProps) {
  const addBeneficiary = () => {
    onChange([...beneficiaries, { name: '', relationship: '', share: '' }]);
  };

  const removeBeneficiary = (index: number) => {
    onChange(beneficiaries.filter((_, i) => i !== index));
  };

  const updateBeneficiary = (index: number, field: string, value: string) => {
    const updated = beneficiaries.map((ben, i) =>
      i === index ? { ...ben, [field]: value } : ben
    );
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Информация о наследниках</CardTitle>
            <CardDescription>Если указаны клиентом</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addBeneficiary}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {beneficiaries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Наследники не указаны</p>
        ) : (
          beneficiaries.map((beneficiary, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Наследник {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBeneficiary(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Имя</label>
                  <Input
                    value={beneficiary.name}
                    onChange={(e) => updateBeneficiary(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Отношение</label>
                  <Input
                    value={beneficiary.relationship}
                    onChange={(e) => updateBeneficiary(index, 'relationship', e.target.value)}
                    placeholder="Сын, дочь, супруг и т.д."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Доля наследства</label>
                  <Input
                    value={beneficiary.share}
                    onChange={(e) => updateBeneficiary(index, 'share', e.target.value)}
                    placeholder="50%, 1/2 и т.д."
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}



