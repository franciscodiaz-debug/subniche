"use client"

import { useState } from "react"
import {
  Bell,
  ChevronRight,
  Home,
  Info,
  Mail,
  Settings,
  Star,
  Terminal,
  User,
} from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { DSSection } from "../ds-section"

const buttonVariants = ["primary", "secondary", "quiet", "quiet_outline", "ghost", "destructive", "link"] as const
const buttonSizes = ["sm", "default", "lg"] as const
const badgeVariants = ["default", "secondary", "destructive", "outline"] as const

const tableData = [
  { id: "001", item: "1962 Fender Stratocaster", status: "For Sale", price: "$45,000" },
  { id: "002", item: "Gibson Les Paul Standard", status: "For Trade", price: "$2,800" },
  { id: "003", item: "Marshall JCM800", status: "Private", price: "$1,200" },
]

export function ShadcnSection() {
  const [sliderValue, setSliderValue] = useState([40])

  return (
    <div className="space-y-12" id="shadcn-root">
      {/* Buttons */}
      <DSSection id="shadcn-buttons" title="Button" source="shadcn/ui">
        <div className="space-y-6">
          {buttonSizes.map((size) => (
            <div key={size} className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                size={size}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {buttonVariants.map((variant) => (
                  <Button key={variant} variant={variant} size={size}>
                    {variant}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              with icon / loading
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                With Icon
              </Button>
              <Button disabled>
                <Spinner className="mr-2 h-4 w-4" />
                Loading...
              </Button>
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DSSection>

      {/* Badge */}
      <DSSection id="shadcn-badge" title="Badge" source="shadcn/ui">
        <div className="flex flex-wrap items-center gap-3">
          {badgeVariants.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
          <Badge variant="default">
            <Star className="mr-1 h-3 w-3" />
            With Icon
          </Badge>
        </div>
      </DSSection>

      {/* Alert */}
      <DSSection id="shadcn-alert" title="Alert" source="shadcn/ui">
        <div className="space-y-3 max-w-lg">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Default alert</AlertTitle>
            <AlertDescription>
              This is the default alert style used for informational messages.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Destructive alert</AlertTitle>
            <AlertDescription>
              Something went wrong. This variant is used for errors and warnings.
            </AlertDescription>
          </Alert>
        </div>
      </DSSection>

      {/* Progress & Skeleton & Spinner */}
      <DSSection id="shadcn-feedback" title="Progress · Skeleton · Spinner" source="shadcn/ui">
        <div className="space-y-6 max-w-sm">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Progress</Label>
            <Progress value={25} />
            <Progress value={60} />
            <Progress value={90} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Skeleton</Label>
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Spinner</Label>
            <div className="flex items-center gap-4">
              <Spinner className="h-4 w-4 text-primary" />
              <Spinner className="h-6 w-6 text-primary" />
              <Spinner className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </div>
      </DSSection>

      {/* Avatar */}
      <DSSection id="shadcn-avatar" title="Avatar" source="shadcn/ui">
        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://placehold.co/80x80/1a2035/d4a853?text=VH" alt="VH" />
            <AvatarFallback>VH</AvatarFallback>
          </Avatar>
          <Avatar className="h-10 w-10">
            <AvatarFallback>KK</AvatarFallback>
          </Avatar>
          <Avatar className="h-14 w-14">
            <AvatarImage src="https://placehold.co/80x80/1a2035/d4a853?text=FG" alt="FG" />
            <AvatarFallback>FG</AvatarFallback>
          </Avatar>
        </div>
      </DSSection>

      {/* Form Elements */}
      <DSSection id="shadcn-form" title="Form Elements" source="shadcn/ui">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Input / Textarea / Select
            </p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="ds-input">Input</Label>
                <Input id="ds-input" placeholder="e.g. 1962 Fender Stratocaster" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ds-textarea">Textarea</Label>
                <Textarea id="ds-textarea" placeholder="Describe your item..." rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ds-select">Select</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guitars">Guitars</SelectItem>
                    <SelectItem value="pedals">Pedals & Effects</SelectItem>
                    <SelectItem value="amps">Amplifiers</SelectItem>
                    <SelectItem value="drums">Drums & Percussion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Checkbox
              </p>
              <div className="space-y-2">
                {["For Sale", "Open to Trade", "Ships Internationally"].map((label) => (
                  <div key={label} className="flex items-center gap-2">
                    <Checkbox id={`ds-cb-${label}`} defaultChecked={label === "For Sale"} />
                    <Label htmlFor={`ds-cb-${label}`}>{label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Radio Group
              </p>
              <RadioGroup defaultValue="sale">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="sale" id="ds-r-sale" />
                  <Label htmlFor="ds-r-sale">For Sale</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="trade" id="ds-r-trade" />
                  <Label htmlFor="ds-r-trade">For Trade</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="both" id="ds-r-both" />
                  <Label htmlFor="ds-r-both">Both</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Switch & Slider
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Switch id="ds-switch" defaultChecked />
                  <Label htmlFor="ds-switch">Enable trade offers</Label>
                </div>
                <div className="space-y-1.5">
                  <Label>Price range: ${sliderValue[0] * 100}</Label>
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DSSection>

      {/* Card */}
      <DSSection id="shadcn-card" title="Card" source="shadcn/ui">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description provides context or metadata.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Card content goes here — can contain any layout or data.</p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="outline">Cancel</Button>
            </CardFooter>
          </Card>
          <Card className="border-primary/40">
            <CardHeader>
              <CardTitle className="text-primary">Highlighted Card</CardTitle>
              <CardDescription>With primary border accent</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge>Featured</Badge>
              <p className="mt-2 text-sm text-muted-foreground">Used for featured or selected items.</p>
            </CardContent>
          </Card>
        </div>
      </DSSection>

      {/* Separator */}
      <DSSection id="shadcn-separator" title="Separator" source="shadcn/ui">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Horizontal</p>
            <div className="text-sm">Section A</div>
            <Separator />
            <div className="text-sm">Section B</div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Left</span>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm">Right</span>
          </div>
        </div>
      </DSSection>

      {/* Overlays */}
      <DSSection id="shadcn-overlays" title="Dialog · Sheet · Popover · Tooltip · HoverCard" source="shadcn/ui">
        <div className="flex flex-wrap gap-3">
          {/* Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm listing</DialogTitle>
                <DialogDescription>
                  Your listing will be published to the marketplace and visible to other members.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Publish</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Trade Interests</SheetTitle>
                <SheetDescription>Configure what you&apos;re willing to trade for this item.</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-3">
                <p className="text-sm text-muted-foreground">Sheet content goes here.</p>
              </div>
            </SheetContent>
          </Sheet>

          {/* Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <p className="text-sm font-medium">Popover content</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Used for contextual overlays anchored to a trigger element.
              </p>
            </PopoverContent>
          </Popover>

          {/* Tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover for Tooltip</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This is a tooltip</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* HoverCard */}
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link">@vinylhunter</Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>VH</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">vinylhunter</p>
                  <p className="text-xs text-muted-foreground">Joined 2022 · 48 listings</p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </DSSection>

      {/* Dropdown */}
      <DSSection id="shadcn-dropdown" title="DropdownMenu" source="shadcn/ui">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Item Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Manage listing</DropdownMenuLabel>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" /> Edit details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Star className="mr-2 h-4 w-4" /> Mark as featured
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete listing</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DSSection>

      {/* Command */}
      <DSSection id="shadcn-command" title="Command (Search Palette)" source="shadcn/ui">
        <div className="max-w-sm rounded-xl border border-border overflow-hidden">
          <Command>
            <CommandInput placeholder="Search listings, users..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Listings">
                <CommandItem>1962 Fender Stratocaster</CommandItem>
                <CommandItem>Gibson Les Paul Standard</CommandItem>
                <CommandItem>Marshall JCM800</CommandItem>
              </CommandGroup>
              <CommandGroup heading="Users">
                <CommandItem>@vinylhunter</CommandItem>
                <CommandItem>@guitarcollector</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </DSSection>

      {/* Tabs */}
      <DSSection id="shadcn-tabs" title="Tabs" source="shadcn/ui">
        <Tabs defaultValue="sale" className="max-w-md">
          <TabsList>
            <TabsTrigger value="sale">For Sale</TabsTrigger>
            <TabsTrigger value="trade">For Trade</TabsTrigger>
            <TabsTrigger value="sold">Sold</TabsTrigger>
          </TabsList>
          <TabsContent value="sale" className="mt-4">
            <p className="text-sm text-muted-foreground">Items currently listed for sale appear here.</p>
          </TabsContent>
          <TabsContent value="trade" className="mt-4">
            <p className="text-sm text-muted-foreground">Items open to trade offers appear here.</p>
          </TabsContent>
          <TabsContent value="sold" className="mt-4">
            <p className="text-sm text-muted-foreground">Completed sales appear here.</p>
          </TabsContent>
        </Tabs>
      </DSSection>

      {/* Accordion */}
      <DSSection id="shadcn-accordion" title="Accordion" source="shadcn/ui">
        <Accordion type="single" collapsible className="max-w-md">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is SubNiche?</AccordionTrigger>
            <AccordionContent>
              SubNiche is a focused marketplace for enthusiasts to buy, sell, and trade within niche communities.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How does trading work?</AccordionTrigger>
            <AccordionContent>
              You can set trade interests on any of your listings. When another member&apos;s item matches your criteria, you&apos;ll receive a match notification.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>What are collections?</AccordionTrigger>
            <AccordionContent>
              Collections are curated groups of items. You can make them public, unlisted, or private.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DSSection>

      {/* Scroll Area */}
      <DSSection id="shadcn-scroll-area" title="ScrollArea" source="shadcn/ui">
        <ScrollArea className="h-32 w-full max-w-xs rounded-md border border-border p-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="border-b border-border/30 py-1.5 text-sm text-muted-foreground last:border-0">
              Listing item #{i + 1} — example scroll content
            </div>
          ))}
        </ScrollArea>
      </DSSection>

      {/* Table */}
      <DSSection id="shadcn-table" title="Table" source="shadcn/ui">
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.id}</TableCell>
                  <TableCell className="font-medium">{row.item}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === "For Sale" ? "default" : row.status === "For Trade" ? "secondary" : "outline"}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-primary font-semibold">{row.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DSSection>

      {/* Breadcrumb */}
      <DSSection id="shadcn-breadcrumb" title="Breadcrumb" source="shadcn/ui">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">
                <Home className="h-3.5 w-3.5" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Market</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <span className="text-foreground">1962 Fender Stratocaster</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </DSSection>

      {/* Pagination */}
      <DSSection id="shadcn-pagination" title="Pagination" source="shadcn/ui">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            {[1, 2, 3, 4, 5].map((page) => (
              <PaginationItem key={page}>
                <PaginationLink href="#" isActive={page === 2}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </DSSection>

      {/* Toggle */}
      <DSSection id="shadcn-toggle" title="Toggle" source="shadcn/ui">
        <div className="flex flex-wrap items-center gap-3">
          <Toggle aria-label="Bold">
            <Star className="h-4 w-4" />
          </Toggle>
          <Toggle aria-label="Default" defaultPressed>
            <Bell className="h-4 w-4" />
            Notifications on
          </Toggle>
          <Toggle variant="outline" aria-label="Outline toggle">
            Outline Toggle
          </Toggle>
        </div>
      </DSSection>
    </div>
  )
}
