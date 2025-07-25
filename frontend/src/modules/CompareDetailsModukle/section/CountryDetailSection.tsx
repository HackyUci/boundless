"use client";
import * as React from "react";
import { CheckIcon, ChevronDown, ArrowRightIcon, RotateCcwIcon } from "lucide-react";
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
import { joinCityData } from "@/lib/cost-data-parser";
import { Label } from "@radix-ui/react-label";

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
          {value ? value : `${label}...`}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
      {/* Helper text when fields are empty */}
      {!originCountry && !destinationCountry && (
        <div className="text-center p-6 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25">
          <p className="text-sm text-muted-foreground">
            Click a country on the map to choose where you are from, then click again to select where you want to go
          </p>
        </div>
      )}

      {/* Country Selection Row */}
      <div className="grid grid-cols-5 gap-4 items-end">
        <div className="col-span-2 space-y-3">
          <Label className="text-sm font-semibold">Where are you from?</Label>
          <CountryComboBox
            label="Origin Country"
            value={originCountry}
            setValue={setOriginCountry}
            countries={countries}
            disabledCountries={destinationCountry ? [destinationCountry] : []}
          />
        </div>
        
        <div className="col-span-1 flex justify-center items-center pb-2">
          <ArrowRightIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="col-span-2 space-y-3">
          <Label className="text-sm font-semibold">Where do you want to go?</Label>
          <CountryComboBox
            label="Destination Country"
            value={destinationCountry}
            setValue={setDestinationCountry}
            countries={countries}
            disabledCountries={originCountry ? [originCountry] : []}
          />
        </div>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <Card className=" dark:from-orange-950/20 dark:to-amber-950/20">
          <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-2xl font-bold ${comparison.isCheaper ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                <span className="text-black">{comparison.destination.country} is </span>{comparison.isCheaper ? 'more affordable' : 'more expensive'} <span className="text-black">than {comparison.origin.country}</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Cost Summary */}
            <div className="bg-gradient-to-br from-white to-orange-50 dark:from-orange-900/30 dark:to-amber-900/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
              <h4 className="font-semibold text-lg mb-3 text-orange-900 dark:text-orange-100">Overall Cost of Living</h4>
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-medium text-orange-800 dark:text-orange-200">{comparison.destination.country}</span>
                <span
                  className={`text-2xl font-bold ${getComparisonColor(
                    comparison.differences.cost
                  )}`}
                >
                  {formatPercentage(comparison.differences.cost)}
                </span>
              </div>
              <p className="text-orange-700 dark:text-orange-300">
                {comparison.isCheaper
                  ? `Living in ${comparison.destination.country} is ${Math.abs(comparison.differences.cost).toFixed(1)}% cheaper than ${comparison.origin.country}`
                  : `Living in ${comparison.destination.country} is ${Math.abs(comparison.differences.cost).toFixed(1)}% more expensive than ${comparison.origin.country}`}
              </p>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-orange-900 dark:text-orange-100">Detailed Breakdown</h4>
              <div className="grid grid-cols-1 gap-4">
                <div className={`flex justify-between items-center p-4 rounded-lg border ${
                  comparison.differences.rent > 0 
                    ? 'bg-gradient-to-br from-white to-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' 
                    : comparison.differences.rent < 0 
                    ? 'bg-gradient-to-br from-white to-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                    : 'bg-gradient-to-br from-white to-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800'
                }`}>
                  <div>
                    <span className="font-semibold">🏠 Rent Prices</span>
                    <p className="text-sm text-muted-foreground">
                      Housing & rental costs
                    </p>
                  </div>
                  <span
                    className={`text-xl font-bold ${getComparisonColor(
                      comparison.differences.rent
                    )}`}
                  >
                    {formatPercentage(comparison.differences.rent)}
                  </span>
                </div>
                <div className={`flex justify-between items-center p-4 rounded-lg border ${
                  comparison.differences.restaurant > 0 
                    ? 'bg-gradient-to-br from-white to-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' 
                    : comparison.differences.restaurant < 0 
                    ? 'bg-gradient-to-br from-white to-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                    : 'bg-gradient-to-br from-white to-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800'
                }`}>
                  <div>
                    <span className="font-semibold">🍽️ Restaurant Prices</span>
                    <p className="text-sm text-muted-foreground">
                      Dining & food delivery
                    </p>
                  </div>
                  <span
                    className={`text-xl font-bold ${getComparisonColor(
                      comparison.differences.restaurant
                    )}`}
                  >
                    {formatPercentage(comparison.differences.restaurant)}
                  </span>
                </div>
                <div className={`flex justify-between items-center p-4 rounded-lg border ${
                  comparison.differences.groceries > 0 
                    ? 'bg-gradient-to-br from-white to-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' 
                    : comparison.differences.groceries < 0 
                    ? 'bg-gradient-to-br from-white to-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                    : 'bg-gradient-to-br from-white to-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800'
                }`}>
                  <div>
                    <span className="font-semibold">🛒 Groceries</span>
                    <p className="text-sm text-muted-foreground">
                      Supermarket & daily needs
                    </p>
                  </div>
                  <span
                    className={`text-xl font-bold ${getComparisonColor(
                      comparison.differences.groceries
                    )}`}
                  >
                    {formatPercentage(comparison.differences.groceries)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cost Indices */}
            <div className="border-t border-orange-200 dark:border-orange-800 pt-6">
              <h4 className="font-semibold text-lg mb-4 text-orange-900 dark:text-orange-100">Cost of Living Indices</h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-white to-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <label className="text-sm font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wide">
                    {comparison.origin.country}
                  </label>
                  <p className="text-3xl font-mono font-bold mt-2 text-orange-900 dark:text-orange-100">
                    {comparison.origin.col_index}
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    Based on {comparison.origin.city}
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-white to-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <label className="text-sm font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wide">
                    {comparison.destination.country}
                  </label>
                  <p className="text-3xl font-mono font-bold mt-2 text-orange-900 dark:text-orange-100">
                    {comparison.destination.col_index}
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    Based on {comparison.destination.city}
                  </p>
                </div>
              </div>
              {comparison.origin.local_purchasing_power_index &&
                comparison.destination.local_purchasing_power_index && (
                  <div className="mt-6 grid grid-cols-2 gap-6">
                    <div className="text-center p-3 bg-gradient-to-br from-white to-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        Local Purchasing Power
                      </span>
                      <p className="text-xl font-mono font-bold mt-1 text-amber-900 dark:text-amber-100">
                        {comparison.origin.local_purchasing_power_index}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-white to-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        Local Purchasing Power
                      </span>
                      <p className="text-xl font-mono font-bold mt-1 text-amber-900 dark:text-amber-100">
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