import Note from "../parts/Note";
import { ChevronDownIcon } from "@heroicons/react/outline";

const MonthYearInput = (props) => {
    let years = [];
    let minYear = props.minYear;
    let maxYear = props.maxYear;

    if (!props.minYear) {
        minYear = 1900;
    }

    if (!props.maxYear) {
        maxYear = new Date().getFullYear();
    }

    for (let year = minYear; year <= maxYear; year++) {
        years.push(year);
    }

  return (
    <div className="my-3">
      <div {...props} className={`border rounded-md px-5 py-2 w-full placeholder-note focus:outline-none focus:border-opacity-0 focus:ring-2 focus:ring-thirdlydark ` + (props.monthError || props.yearError ? "ring-thirdlydark ring-1 border-opacity-0" : null)}>
        <select className="appearance-none pr-5 cursor-pointer focus:outline-none" name={props.monthInputName} value={props.monthValue} onChange={props.onChange}>
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="April">April</option>
          <option value="May">May</option>
          <option value="June">June</option>
          <option value="July">July</option>
          <option value="August">August</option>
          <option value="September">September</option>
          <option value="October">October</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>
        <ChevronDownIcon className="inline-block h-4 relative -left-3 -top-0.5"/>
        <select className="appearance-none pr-5 cursor-pointer focus:outline-none" name={props.yearInputName} value={props.yearValue} onChange={props.onChange}>
          {years.map((year, i) => <option value={year} key={i}>{year}</option>)}
        </select>
        <ChevronDownIcon className="inline-block h-4 relative -left-3 -top-0.5"/>
      </div>
      {props.monthError ? <Note customColor="danger">Month Error: {props.monthError}</Note> : null}
      {props.yearError ? <Note customColor="danger">Year Error: {props.yearError}</Note> : null}
    </div>
  );
};

export default MonthYearInput;
