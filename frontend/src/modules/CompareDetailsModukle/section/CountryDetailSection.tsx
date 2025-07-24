"use client";
import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { joinCityData } from "@/lib/cost-data-parser";

interface City {
  city: string;
  country: string;
  lat: number;
  lon: number;
  col_index?: number;
  rent_index?: number;
  groceries_index?: number;
  restaurant_price_index?: number;
  local_purchasing_power_index?: number;
}

interface CompareDetailSectionProps {
  selectedCity: City | null;
}

function CountryComboBox({
  label,
  value,
  setValue,
  countries,
  disabledCountries,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  countries: string[];
  disabledCountries?: string[];
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? value : `Select ${label}...`}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search ${label}...`} />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country}
                  value={country}
                  disabled={disabledCountries?.includes(country)}
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === country ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {country}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const CompareDetailSection: React.FC<CompareDetailSectionProps> = ({
  selectedCity,
}) => {
  const [originCountry, setOriginCountry] = React.useState<string>("");
  const [destinationCountry, setDestinationCountry] = React.useState<string>("");
  const [clickCount, setClickCount] = React.useState(0);

  const joinedData = React.useMemo(() => joinCityData(), []);
  const countries = React.useMemo(() => {
    const countrySet = new Set(
      joinedData.filter((city) => city.col_index).map((city) => city.country)
    );
    return Array.from(countrySet).sort();
  }, [joinedData]);

  const comparison = React.useMemo(() => {
    if (!originCountry || !destinationCountry) return null;
    const originData = joinedData.find(
      (city) => city.country === originCountry && city.col_index
    );
    const destData = joinedData.find(
      (city) => city.country === destinationCountry && city.col_index
    );
    if (!originData?.col_index || !destData?.col_index) return null;
    const costDiff =
      ((destData.col_index - originData.col_index) / originData.col_index) * 100;
    const rentDiff =
      originData.rent_index && destData.rent_index
        ? ((destData.rent_index - originData.rent_index) /
            originData.rent_index) *
          100
        : 0;
    const restaurantDiff =
      originData.restaurant_price_index && destData.restaurant_price_index
        ? ((destData.restaurant_price_index -
            originData.restaurant_price_index) /
            originData.restaurant_price_index) *
          100
        : 0;
    const groceriesDiff =
      originData.groceries_index && destData.groceries_index
        ? ((destData.groceries_index - originData.groceries_index) /
            originData.groceries_index) *
          100
        : 0;
    return {
      origin: originData,
      destination: destData,
      differences: {
        cost: costDiff,
        rent: rentDiff,
        restaurant: restaurantDiff,
        groceries: groceriesDiff,
      },
      isCheaper: destData.col_index < originData.col_index,
    };
  }, [originCountry, destinationCountry, joinedData]);

  React.useEffect(() => {
    if (selectedCity) {
      if (clickCount === 0 || !originCountry) {
        setOriginCountry(selectedCity.country);
        setClickCount(1);
      } else if (clickCount === 1 || !destinationCountry) {
        if (selectedCity.country !== originCountry) {
          setDestinationCountry(selectedCity.country);
          setClickCount(2);
        }
      }
    }
  }, [selectedCity, clickCount, originCountry, destinationCountry]);

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };
  const getComparisonColor = (value: number) => {
    if (value > 0) return "text-red-600";
    if (value < 0) return "text-green-600";
    return "text-gray-600";
  };
  const resetSelection = () => {
    setOriginCountry("");
    setDestinationCountry("");
    setClickCount(0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Pick Your Origin Country
            {originCountry && <Badge variant="secondary">{originCountry}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <CountryComboBox
              label="Origin Country"
              value={originCountry}
              setValue={setOriginCountry}
              countries={countries}
              disabledCountries={destinationCountry ? [destinationCountry] : []}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Pick Destination Country
            {destinationCountry && (
              <Badge variant="secondary">{destinationCountry}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <CountryComboBox
              label="Destination Country"
              value={destinationCountry}
              setValue={setDestinationCountry}
              countries={countries}
              disabledCountries={originCountry ? [originCountry] : []}
            />
          </div>
        </CardContent>
      </Card>
      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                Comparison Results
                <Badge variant={comparison.isCheaper ? "default" : "destructive"}>
                  {comparison.isCheaper ? "Cheaper" : "More Expensive"}
                </Badge>
              </div>
              <button
                onClick={resetSelection}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Overall Cost of Living</h4>
              <div className="flex justify-between items-center">
                <span>{comparison.destination.country}</span>
                <span
                  className={`font-bold ${getComparisonColor(
                    comparison.differences.cost
                  )}`}
                >
                  {formatPercentage(comparison.differences.cost)} vs{" "}
                  {comparison.origin.country}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {comparison.isCheaper
                  ? `Living in ${comparison.destination.country} is cheaper than ${comparison.origin.country}`
                  : `Living in ${comparison.destination.country} is more expensive than ${comparison.origin.country}`}
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Detailed Breakdown</h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <span className="font-medium">Rent Prices</span>
                    <p className="text-sm text-muted-foreground">
                      Housing & rental costs
                    </p>
                  </div>
                  <span
                    className={`font-bold ${getComparisonColor(
                      comparison.differences.rent
                    )}`}
                  >
                    {formatPercentage(comparison.differences.rent)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <span className="font-medium">Restaurant Prices</span>
                    <p className="text-sm text-muted-foreground">
                      Dining & food delivery
                    </p>
                  </div>
                  <span
                    className={`font-bold ${getComparisonColor(
                      comparison.differences.restaurant
                    )}`}
                  >
                    {formatPercentage(comparison.differences.restaurant)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <span className="font-medium">Groceries</span>
                    <p className="text-sm text-muted-foreground">
                      Supermarket & daily needs
                    </p>
                  </div>
                  <span
                    className={`font-bold ${getComparisonColor(
                      comparison.differences.groceries
                    )}`}
                  >
                    {formatPercentage(comparison.differences.groceries)}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Cost of Living Indices</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {comparison.origin.country}
                  </label>
                  <p className="text-lg font-mono">
                    {comparison.origin.col_index}
                  </p>
                  <p className="text-xs text-gray-500">
                    Based on {comparison.origin.city}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {comparison.destination.country}
                  </label>
                  <p className="text-lg font-mono">
                    {comparison.destination.col_index}
                  </p>
                  <p className="text-xs text-gray-500">
                    Based on {comparison.destination.city}
                  </p>
                </div>
              </div>
              {comparison.origin.local_purchasing_power_index &&
                comparison.destination.local_purchasing_power_index && (
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Local Purchasing Power:
                      </span>
                      <p className="font-mono">
                        {comparison.origin.local_purchasing_power_index}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Local Purchasing Power:
                      </span>
                      <p className="font-mono">
                        {comparison.destination.local_purchasing_power_index}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};