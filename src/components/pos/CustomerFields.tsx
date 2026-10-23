"use client";

import { Phone, UserRound } from "lucide-react";
import { Badge, Field, Input } from "@/components/ui";
import type { Customer } from "./useCustomerLookup";

/** Phone-first customer lookup: an exact phone match fills and locks the name. */
export default function CustomerFields({
  phone,
  name,
  onPhoneChange,
  onNameChange,
  matchedCustomer,
  lookupDone,
  phoneHint,
  idPrefix,
}: {
  phone: string;
  name: string;
  onPhoneChange: (value: string) => void;
  onNameChange: (value: string) => void;
  matchedCustomer: Customer | null;
  lookupDone: boolean;
  phoneHint?: string;
  idPrefix: string;
}) {
  return (
    <>
      <Field label="Phone" htmlFor={`${idPrefix}-phone`} hint={phoneHint}>
        <Input
          id={`${idPrefix}-phone`}
          icon={Phone}
          type="tel"
          inputMode="tel"
          autoComplete="off"
          className="tabular-nums"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
        />
      </Field>
      {phone.trim() && lookupDone && (
        <Field
          label={
            <span className="flex w-full items-center justify-between">
              Name
              {matchedCustomer ? (
                <Badge tone="primary" dot>
                  Existing customer
                </Badge>
              ) : (
                <Badge tone="info" dot>
                  New customer
                </Badge>
              )}
            </span>
          }
          htmlFor={`${idPrefix}-name`}
          hint={matchedCustomer ? undefined : "They'll be saved when the order completes."}
        >
          <Input
            id={`${idPrefix}-name`}
            icon={UserRound}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={Boolean(matchedCustomer)}
          />
        </Field>
      )}
    </>
  );
}
