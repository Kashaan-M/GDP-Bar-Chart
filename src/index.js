import { select, selectAll } from 'd3-selection';
import { axisBottom, axisLeft } from 'd3-axis';
import { json } from 'd3-fetch';
import { scaleLinear } from 'd3-scale';
import { transition } from 'd3-transition';
import { min, max } from 'd3-array';

import './index.css';

// variables
let dataset = []; // we will fetch JSON data on line 85,86 and nest 275 arrays inside this dataset array
let w = 900; // width of <svg>
let h = 500; // height of <svg>
let padding = 30; // padding added to x-axis, y-axis, xScale, yScale, <rect> height and more
const years = [
  1947, 1950, 1955, 1960, 1965, 1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005,
  2010, 2015,
];
// const years is used for tick values on x-axis. I used this because I was receiving values from dataset like '1,947','2,015'
let multiples = []; // This is used in the getXAxisScale function
for (let i = 0; i < 69; i++) {
  multiples.push(i);
}
// above for loop is for making multiples an array of numbers from 0 t0 68. This is because 68*4 == 272 . We use this to increment count by 4 after 4 iterations
let count = 0;
// count and multiples are used in getXAxisScale function

// functions
function getYear(datasetItem) {
  // dataset contains dates in string format & we need numbers and only years for now
  let dateStr = datasetItem[0];
  let yearStr = dateStr.substring(0, 4);
  let year = parseInt(yearStr);
  //console.log('year ', year);
  return year;
}

// get Quarters for tooltip
function getQuarters(str) {
  // str is date string . we use substring() below to get the value of month and then based on a repeating pattern in the months we calculate Quarters from 1 to 4
  let months = str.substring(5, 7);
  return months === '01'
    ? 'Q1'
    : months === '04'
    ? 'Q2'
    : months === '07'
    ? 'Q3'
    : 'Q4'; // else return Q4 because it is going to be the tenth month
}
6;
// Complex function. In simple english this returns equal spacing on the x-axis like 1947, 1947.25,1947.50,1947.75,1948,1948.25,1948.50,1948.75 and so on.
// we need this equal spacing for placing the <rect> elements properly along the x-Axis. 'xScale' won't do this for us bcoz we have a "string" value for the
// date inside the dataset

function getXAxisScale(datasetItem, index) {
  let dateStr = datasetItem[0];
  let xAxisScaleStr = dateStr.substring(0, 4);
  for (let j = 0; j < multiples.length; j++) {
    if (index !== 0) {
      if (index == multiples[j] * 4) {
        count += 4;
      }
    }
  }
  let xAxisScale = parseInt(xAxisScaleStr) + (index - count) * 0.25;
  //console.log('xAxisScale ', xAxisScale, 'count ', count);
  return xAxisScale;
}

// this function assigns fill colors for the <rect> elements based on their indicies
function getSmoothGradient(index) {
  if (index < 55) {
    return 'hsl(105,70%,46%)';
  } else if (index >= 55 && index < 110) {
    return 'hsl(120,72%,40%)';
  } else if (index >= 110 && index < 165) {
    return 'hsl(130,76%,36%)';
  } else if (index >= 165 && index < 220) {
    return 'hsl(140,89%,31%)';
  } else if (index >= 220 && index < 276) {
    return 'hsl(143,90%,25%)';
  }
}

// URL for the JSON data file
// Note: I build this Visualization using simple dataset first ( i.e. let dataset = [['1947-01-01',243.1],['1947-04-01',246.3] ........ ] )
// without first involving data-fetching for making my work a bit easier
let url =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

// fetch JSON Data
async function fetchGDP(url) {
  const jsonResponse = await json(url);
  return jsonResponse;
}
fetchGDP(url).then((jsonResponse) => {
  dataset = [...jsonResponse['data']];

  // I am including everything below this line inside this callback function to a then() because I don't know how to properly separate the
  // asynchronous data fetching from my d3 visualization code and keeping the visualization working and not crashing

  // Dates go on the x-axis
  const xScale = scaleLinear()
    .domain([min(dataset, (d) => getYear(d)), max(dataset, (d) => getYear(d))])
    .range([padding + 15, w - padding - 15]);

  // GDPs go on the y-axis
  const yScale = scaleLinear()
    .domain([0, max(dataset, (d) => d[1])])
    .range([h, padding]);

  const xAxis = axisBottom(xScale)
    .tickValues(years)
    .tickFormat((x) => x);
  const yAxis = axisLeft(yScale);

  //tooltip : The thing which shows GDP related data when you hover over a <rect>

  const tooltip = select('.container').append('div').attr('id', 'tooltip');

  // svg element
  const svg = select('.container')
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .style('background', 'cornsilk')
    .style('box-shadow', '5px 5px 25px 2px hsl(242,15%,25%)');

  // x -axis inside <svg>
  svg
    .append('g')
    .style('transform', `translate(0px,${h - 24}px)`)
    .attr('id', 'x-axis')
    .call(xAxis);
  // y-axis inside <svg>
  svg
    .append('g')
    .style('transform', `translate(${padding + 15}px,-24px)`)
    .attr('id', 'y-axis')
    .call(yAxis);
  // y-axis label as shown in the demo app here (https://bar-chart.freecodecamp.rocks/)
  svg
    .append('text')
    .text('Gross Domestic Product')
    .attr('x', 0)
    .attr('y', 0)
    .style('transform-origin', 'center center')
    .style('transform', 'rotate(-90deg) translate(475px,-125px)');

  // All the <rect> elements

  svg
    .selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('x', (d, i) => xScale(getXAxisScale(d, i)))
    .attr('y', (d) => yScale(d[1]))
    .attr('class', 'bar')
    .attr('fill', (d, i) => getSmoothGradient(i))
    .attr('data-date', (d) => d[0])
    .attr('data-gdp', (d) => d[1])
    .attr('width', w / 275)
    .attr('height', (d) => h - yScale(d[1]))
    .style('transform', `translate(0,-24px)`)
    .on('mouseover', function (e, d) {
      tooltip
        .attr('data-date', d[0])
        .transition()
        .duration(200)
        .style('opacity', 1);
      tooltip.html(
        `<p>${d[0].substring(0, 4)} ${getQuarters(d[0])}</p><p>$${
          d[1]
        } Billion</p>`
      );
    })
    .on('mouseout', function (e, d) {
      tooltip.transition().duration(200).style('opacity', 0);
    });
});
