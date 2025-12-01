'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Plus, X } from 'lucide-react';

interface RelativesFormProps {
  relatives: Array<{
    name: string;
    relationship: string;
    phone: string;
    email: string;
  }>;
  onChange: (relatives: Array<{
    name: string;
    relationship: string;
    phone: string;
    email: string;
  }>) => void;
}

export function RelativesForm({ relatives, onChange }: RelativesFormProps) {
  const addRelative = () => {
    onChange([...relatives, { name: '', relationship: '', phone: '', email: '' }]);
  };

  const removeRelative = (index: number) => {
    onChange(relatives.filter((_, i) => i !== index));
  };

  const updateRelative = (index: number, field: string, value: string) => {
    const updated = relatives.map((rel, i) =>
      i === index ? { ...rel, [field]: value } : rel
    );
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Контакты родственников</CardTitle>
            <CardDescription>Если указаны клиентом</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addRelative}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {relatives.length === 0 ? (
          <p className="text-sm text-muted-foreground">Родственники не указаны</p>
        ) : (
          relatives.map((relative, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Родственник {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRelative(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Имя</label>
                  <Input
                    value={relative.name}
                    onChange={(e) => updateRelative(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Отношение</label>
                  <Input
                    value={relative.relationship}
                    onChange={(e) => updateRelative(index, 'relationship', e.target.value)}
                    placeholder="Сын, дочь, супруг и т.д."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Телефон</label>
                  <Input
                    type="tel"
                    value={relative.phone}
                    onChange={(e) => updateRelative(index, 'phone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={relative.email}
                    onChange={(e) => updateRelative(index, 'email', e.target.value)}
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



