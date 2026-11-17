export function calculate({people,hours,days,rate}){
 const values={people:Number(people),hours:Number(hours),days:Number(days),rate:Number(rate)};
 if(!Object.values(values).every(Number.isFinite))throw new RangeError('Invalid number');
 if(!Number.isInteger(values.people)||values.people<0||values.people>249||values.hours<0||values.hours>8||!Number.isInteger(values.hours*2)||!Number.isInteger(values.days)||values.days<1||values.days>31||values.rate<0)throw new RangeError('Outside supported assumptions');
 const monthlyHours=values.people*values.hours*values.days,monthlyValue=monthlyHours*values.rate;
 return {monthlyHours,monthlyValue,yearlyHours:monthlyHours*12,yearlyValue:monthlyValue*12};
}

export function calculateProductivity({people,hours,days,workingHours=8}){
 const day=Number(workingHours),{monthlyHours}=calculate({people,hours,days,rate:0});
 if(!Number.isFinite(day)||day<.5||day>24||!Number.isInteger(day*2)||Number(hours)>day)throw new RangeError('Invalid working day');
 return {productivityPercent:Number(people)===0?0:Number(hours)/day*100,monthlyDays:monthlyHours/day};
}
