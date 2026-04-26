import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statuses = ["For Sale", "For Trade", "In Collection", "Wanted"];
const conditions = ["Excellent", "Very Good", "Good", "Project"];

export function FilterPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" placeholder="Pedals, amps, guitars..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" placeholder="Fender, Chase Bliss..." />
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-foreground">
            Status
          </legend>
          {statuses.map((status) => (
            <label
              key={status}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Checkbox />
              {status}
            </label>
          ))}
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-foreground">
            Condition
          </legend>
          {conditions.map((condition) => (
            <label
              key={condition}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Checkbox />
              {condition}
            </label>
          ))}
        </fieldset>
      </CardContent>
    </Card>
  );
}
