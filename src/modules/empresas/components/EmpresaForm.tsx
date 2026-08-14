"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Combobox, type ComboboxOption } from "@/components/ui/Combobox";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ORIGEM_LEAD_OPTIONS, UF_OPTIONS } from "../constants";
import type { EmpresaInput } from "../types";

export interface EmpresaFormProps {
  initialValues: EmpresaInput;
  submitLabel: string;
  onSubmit: (input: EmpresaInput) => Promise<{ error: string | null }>;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ViaCepResponse {
  erro?: boolean;
  logradouro?: string;
  localidade?: string;
  uf?: string;
}

interface IbgeMunicipio {
  nome: string;
}

export function EmpresaForm({
  initialValues,
  submitLabel,
  onSubmit,
  onSuccess,
  onCancel,
}: EmpresaFormProps) {
  const [values, setValues] = useState<EmpresaInput>(initialValues);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cidadeOptions, setCidadeOptions] = useState<ComboboxOption[]>([]);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const isFirstCepRender = useRef(true);

  function update<K extends keyof EmpresaInput>(key: K, value: EmpresaInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  // Ao digitar um CEP completo, busca o endereço no ViaCEP e preenche
  // endereço/cidade/UF. Ignora o primeiro render pra não sobrescrever dados
  // já salvos ao simplesmente abrir o formulário de edição.
  useEffect(() => {
    if (isFirstCepRender.current) {
      isFirstCepRender.current = false;
      return;
    }

    const digits = values.cep.replace(/\D/g, "");
    if (digits.length !== 8) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data: ViaCepResponse = await res.json();
        if (cancelled || data.erro) return;
        setValues((prev) => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          cidade: data.localidade || prev.cidade,
          uf: data.uf || prev.uf,
        }));
      } catch {
        // Falha de rede não deve travar o preenchimento manual do formulário.
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [values.cep]);

  // Ao definir a UF (manualmente ou via CEP), busca as cidades do estado no
  // IBGE pra alimentar o combobox de cidade.
  useEffect(() => {
    if (!values.uf) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingCidades(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${values.uf}/municipios`)
      .then((res) => res.json())
      .then((data: IbgeMunicipio[]) => {
        if (cancelled) return;
        setCidadeOptions(
          data
            .map((c) => ({ value: c.nome, label: c.nome }))
            .sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
        );
      })
      .catch(() => {
        if (!cancelled) setCidadeOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCidades(false);
      });

    return () => {
      cancelled = true;
    };
  }, [values.uf]);

  // Garante que a cidade já salva apareça no combobox mesmo antes da busca
  // terminar (ou se ela não constar na lista retornada pelo IBGE).
  const cidadeSelectOptions = useMemo(() => {
    if (values.cidade && !cidadeOptions.some((o) => o.value === values.cidade)) {
      return [{ value: values.cidade, label: values.cidade }, ...cidadeOptions];
    }
    return cidadeOptions;
  }, [cidadeOptions, values.cidade]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    setIsSubmitting(true);
    const result = await onSubmit(values);
    setIsSubmitting(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Empresa"
          placeholder="Razão social ou nome fantasia"
          required
          value={values.nome}
          onChange={(e) => update("nome", e.target.value)}
        />

        <Input
          label="CNPJ"
          placeholder="00.000.000/0000-00"
          value={values.cnpj}
          onChange={(e) => update("cnpj", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Setor"
          placeholder="Ex: Automotivo, Offshore, Químico..."
          required
          value={values.setor}
          onChange={(e) => update("setor", e.target.value)}
        />

        <Select
          label="Origem do Lead"
          required
          placeholder="Selecione a origem"
          value={values.origem_lead}
          onChange={(e) => update("origem_lead", e.target.value)}
          options={ORIGEM_LEAD_OPTIONS}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr_1fr]">
        <Input
          label="CEP"
          placeholder="00000-000"
          value={values.cep}
          onChange={(e) => update("cep", e.target.value)}
        />

        <Select
          label="UF"
          placeholder="UF"
          value={values.uf}
          onChange={(e) => update("uf", e.target.value)}
          options={UF_OPTIONS}
        />

        <Input
          label="Número"
          value={values.numero}
          onChange={(e) => update("numero", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.5fr]">
        <Input
          label="Endereço"
          value={values.endereco}
          onChange={(e) => update("endereco", e.target.value)}
        />

        <Combobox
          label="Cidade"
          placeholder={
            !values.uf
              ? "Selecione a UF primeiro"
              : loadingCidades
                ? "Carregando cidades…"
                : "Selecione a cidade"
          }
          value={values.cidade}
          onChange={(v) => update("cidade", v)}
          options={cidadeSelectOptions}
        />
      </div>

      <Textarea
        label="Observações"
        value={values.observacoes}
        onChange={(e) => update("observacoes", e.target.value)}
      />

      {formError && <p className="text-sm text-temp-quente">{formError}</p>}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
