"use client";

import { Phone, UserRound } from "lucide-react";
import { Badge, Field, Input } from "@/components/ui";
import { useI18n } from "@/i18n/I18nProvider";
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
  const { t } = useI18n();
  return (
    <>
      <Field label={t.pos.phone} htmlFor={`${idPrefix}-phone`} hint={phoneHint}>
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
              {t.pos.name}
              {matchedCustomer ? (
                <Badge tone="primary" dot>
                  {t.pos.existing}
                </Badge>
              ) : (
                <Badge tone="info" dot>
                  {t.pos.newCustomer}
                </Badge>
              )}
            </span>
          }
          htmlFor={`${idPrefix}-name`}
          hint={matchedCustomer ? undefined : t.pos.newCustomerHint}
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
