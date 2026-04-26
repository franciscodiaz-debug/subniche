"use client";

import { FormSection } from "@/components/add-item/form-section";
import type { PublishingState } from "@/components/add-item/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { MockCommunity } from "@/data/mock";

type PublishingContextFieldsProps = {
  communities: MockCommunity[];
  onChange: (publishing: PublishingState) => void;
  publishing: PublishingState;
};

export function PublishingContextFields({
  communities,
  onChange,
  publishing,
}: PublishingContextFieldsProps) {
  const update = (next: Partial<PublishingState>) =>
    onChange({ ...publishing, ...next });

  const toggleCommunity = (communityId: string) => {
    const active = publishing.communityIds.includes(communityId);
    update({
      communityIds: active
        ? publishing.communityIds.filter((id) => id !== communityId)
        : [...publishing.communityIds, communityId],
    });
  };

  return (
    <FormSection
      eyebrow="Publishing"
      title="Where should it appear?"
      description="Choose where this item appears. Publishing to communities makes the same listing visible in those contexts; it does not create duplicate listings."
    >
      <div className="space-y-2">
        <Label className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-sm font-medium text-muted-foreground">
          <Checkbox
            checked={publishing.publicMarket}
            onChange={(event) =>
              update({ publicMarket: event.target.checked })
            }
          />
          Public Market
        </Label>
        {communities.map((community) => (
          <Label
            key={community.id}
            className="flex items-start gap-2 rounded-lg border border-border bg-background p-3 text-sm font-medium text-muted-foreground"
          >
            <Checkbox
              checked={publishing.communityIds.includes(community.id)}
              onChange={() => toggleCommunity(community.id)}
            />
            <span>
              <span className="block text-foreground">{community.name}</span>
              <span className="block pt-1 text-xs leading-5 text-muted-foreground">
                {community.visibility} - {community.memberCount}
              </span>
            </span>
          </Label>
        ))}
      </div>
    </FormSection>
  );
}
