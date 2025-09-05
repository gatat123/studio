'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CategoryOption {
  value: string;
  label: string;
  icon: string;
  description: string;
}

const categories: CategoryOption[] = [
  {
    value: 'webtoon',
    label: '웹툰',
    icon: '🎨',
    description: '웹툰 및 웹소설 일러스트 작업',
  },
  {
    value: 'illustration',
    label: '일러스트',
    icon: '🖼️',
    description: '단일 일러스트 또는 삽화 작업',
  },
  {
    value: 'storyboard',
    label: '스토리보드',
    icon: '📋',
    description: '애니메이션 또는 영상 스토리보드',
  },
  {
    value: 'concept',
    label: '컨셉아트',
    icon: '💡',
    description: '캐릭터 디자인 및 컨셉 아트',
  },
];

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CategorySelector({ value, onChange }: CategorySelectorProps) {
  return (
    <RadioGroup value={value} onValueChange={onChange}>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <Card
            key={category.value}
            className={cn(
              'relative cursor-pointer transition-all hover:shadow-md',
              value === category.value && 'ring-2 ring-primary'
            )}
          >
            <Label
              htmlFor={category.value}
              className="flex items-start p-4 cursor-pointer"
            >
              <RadioGroupItem
                value={category.value}
                id={category.value}
                className="sr-only"
              />
              <span className="text-3xl mr-3">{category.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{category.label}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {category.description}
                </div>
              </div>
            </Label>
          </Card>
        ))}
      </div>
    </RadioGroup>
  );
}
