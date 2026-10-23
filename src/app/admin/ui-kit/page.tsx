import { notFound } from "next/navigation";
import { ArrowRight, PackageOpen, Plus, Search, Trash2, Pencil } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  EmptyState,
  Field,
  Input,
  LinkButton,
  PageHeader,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  TableEmpty,
  Textarea,
} from "@/components/ui";

// Living styleguide for the UI kit. Development only.
export default function UiKitPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Design system"
        title="UI kit"
        description="Every shared component in both themes. Use these instead of styling controls by hand."
        actions={
          <>
            <Button variant="secondary" icon={Search}>Secondary</Button>
            <Button icon={Plus}>New item</Button>
          </>
        }
      />

      <Card>
        <CardHeader title="Buttons" description="Variants and sizes" />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger" icon={Trash2}>Delete</Button>
            <Button loading>Saving</Button>
            <Button disabled>Disabled</Button>
            <LinkButton href="/admin" variant="secondary" trailingIcon={ArrowRight}>Link button</LinkButton>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large (POS)</Button>
            <Button variant="ghost" iconOnly icon={Pencil} aria-label="Edit" />
            <Button variant="danger-ghost" iconOnly icon={Trash2} aria-label="Delete" />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Form controls" />
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <Field label="Item name" htmlFor="kit-name" hint="Shown on receipts.">
            <Input id="kit-name" placeholder="Prayer mat" />
          </Field>
          <Field label="Search" htmlFor="kit-search">
            <Input id="kit-search" icon={Search} placeholder="Name or barcode" />
          </Field>
          <Field label="Category" htmlFor="kit-cat">
            <Select id="kit-cat" defaultValue="books">
              <option value="books">Books</option>
              <option value="perfume">Perfumes</option>
            </Select>
          </Field>
          <Field label="Selling price" htmlFor="kit-price" error="Price must be greater than 0.">
            <Input id="kit-price" type="number" defaultValue="0" invalid />
          </Field>
          <Field label="Notes" htmlFor="kit-notes" optional className="sm:col-span-2">
            <Textarea id="kit-notes" placeholder="اسم المنتج بالعربية — Arabic renders in the same font" />
          </Field>
        </CardBody>
        <CardFooter>
          <Button variant="ghost">Cancel</Button>
          <Button>Save item</Button>
        </CardFooter>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Alert tone="danger" title="Couldn't save">Barcode is already used by another item.</Alert>
        <Alert tone="warning">Only 3 left in stock.</Alert>
        <Alert tone="success">Sale completed.</Alert>
        <Alert tone="info">Deliveries sync every minute.</Alert>
      </div>

      <Card>
        <CardHeader title="Badges" />
        <CardBody className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="primary" dot>Delivered</Badge>
          <Badge tone="info" dot>Out for delivery</Badge>
          <Badge tone="accent" dot>Pending</Badge>
          <Badge tone="danger" dot>Cancelled</Badge>
          <Badge tone="accent">Low stock · 3</Badge>
        </CardBody>
      </Card>

      <Table>
        <THead>
          <TR>
            <TH>Item</TH>
            <TH>Category</TH>
            <TH numeric>Price</TH>
            <TH numeric>Stock</TH>
            <TH><span className="sr-only">Actions</span></TH>
          </TR>
        </THead>
        <TBody>
          {[
            ["Prayer mat — velvet", "Prayer items", 25, 14],
            ["مصحف شريف", "Books", 18.5, 3],
            ["Oud perfume 12ml", "Perfumes", 40, 0],
          ].map(([name, cat, price, stock]) => (
            <TR key={name as string}>
              <TD className="font-medium text-fg">{name}</TD>
              <TD>{cat}</TD>
              <TD numeric>{(price as number).toFixed(2)}</TD>
              <TD numeric>
                <Badge tone={stock === 0 ? "danger" : (stock as number) < 5 ? "accent" : "neutral"}>{stock}</Badge>
              </TD>
              <TD className="text-right">
                <Button variant="ghost" size="sm" iconOnly icon={Pencil} aria-label="Edit" />
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>

      <Table>
        <THead><TR><TH>Customer</TH><TH>Phone</TH></TR></THead>
        <TBody><TableEmpty colSpan={2}>No customers match “Ahmad”.</TableEmpty></TBody>
      </Table>

      <Card>
        <EmptyState
          icon={PackageOpen}
          title="No purchases yet"
          description="Record stock you buy from suppliers to keep costs and profit accurate."
          action={<Button icon={Plus}>Record purchase</Button>}
        />
      </Card>
    </div>
  );
}
