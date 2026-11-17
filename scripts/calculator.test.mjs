import {test} from 'node:test';import assert from 'node:assert/strict';import {calculate,calculateProductivity} from '../public/js/calculator.mjs';
test('monthly and yearly totals use hours per person per day',()=>{assert.deepEqual(calculate({people:6,hours:2,days:22,rate:13}),{monthlyHours:264,monthlyValue:3432,yearlyHours:3168,yearlyValue:41184});});
test('no hours produces no fictitious savings',()=>{assert.deepEqual(calculate({people:6,hours:0,days:20,rate:13}),{monthlyHours:0,monthlyValue:0,yearlyHours:0,yearlyValue:0});});
test('custom hourly assumptions change only value, not hours',()=>{const a=calculate({people:2,hours:1.5,days:20,rate:20});assert.equal(a.monthlyHours,60);assert.equal(a.monthlyValue,1200);});
test('rejects incomplete, non-finite and out-of-range assumptions',()=>{for(const values of [{people:-1,hours:1,days:22,rate:13},{people:250,hours:1,days:22,rate:13},{people:2,hours:1.25,days:22,rate:13},{people:3,hours:9,days:22,rate:13},{people:1.5,hours:1,days:22,rate:13},{people:2,hours:1,days:32,rate:13},{people:2,hours:1,days:20,rate:NaN}])assert.throws(()=>calculate(values),RangeError);});

test('supports zero employees and the requested 249-person, 8-hour maximum',()=>{assert.deepEqual(calculate({people:0,hours:8,days:22,rate:20}),{monthlyHours:0,monthlyValue:0,yearlyHours:0,yearlyValue:0});assert.deepEqual(calculate({people:249,hours:8,days:22,rate:20}),{monthlyHours:43824,monthlyValue:876480,yearlyHours:525888,yearlyValue:10517760});});
test('uses the supplied salary without the old reference cap',()=>{assert.equal(calculate({people:1,hours:2,days:22,rate:500}).monthlyValue,22000);});

test('productivity measures reusable time against the editable working day',()=>{
 assert.deepEqual(calculateProductivity({people:6,hours:2,days:22,workingHours:8}),{productivityPercent:25,monthlyDays:33});
 const shorterDay=calculateProductivity({people:6,hours:2,days:22,workingHours:7});
 assert.equal(shorterDay.productivityPercent,2/7*100);
 assert.equal(shorterDay.monthlyDays,264/7);
 assert.equal(calculateProductivity({people:3,hours:2,days:10,workingHours:8}).productivityPercent,25);
});

test('zero team or zero freed time has no productivity gain; full day is bounded at 100%',()=>{
 for(const values of [{people:0,hours:2,days:22},{people:6,hours:0,days:22}])assert.deepEqual(calculateProductivity(values),{productivityPercent:0,monthlyDays:0});
 assert.deepEqual(calculateProductivity({people:249,hours:8,days:31}),{productivityPercent:100,monthlyDays:7719});
});

test('rejects an impossible or missing working-day assumption',()=>{
 for(const workingHours of [0,-1,25,1.25,NaN,Infinity,''])assert.throws(()=>calculateProductivity({people:6,hours:2,days:22,workingHours}),RangeError);
 assert.throws(()=>calculateProductivity({people:6,hours:8,days:22,workingHours:7}),RangeError);
});
