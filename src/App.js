import React from "react";

import logo from './logo.svg';
import './App.css';
import * as d3 from "d3";
import { geoAlbersUsa, geoPath } from "d3-geo";

import { feature } from "topojson-client";

/*****************
 * D3 components *
 *****************/

const colorDict = {
  "Yes": "#00c853",
  "No": "#d50000",
  "Complicated": "#fbc02d",
  "In progress": "#69f0ae",
  "Unknown": "#dddddd",
  "": "#000000"
};

export const useD3 = (renderFn, dependencies) => {
  const ref = React.useRef();

  React.useEffect(() => {
    renderFn(d3.select(ref.current));
    return () => {};
  }, dependencies);

  return ref;
};


function USMap({ id, width, height, colorKey, genderData, topology }) {

  const ref = useD3(
    svg => {
      const path = geoPath().projection(geoAlbersUsa());

      const g = svg.append("g");

      const innerG = g.selectAll("path")
                      .data(feature(topology, topology.objects.us).features)
                      .enter()
                      .append("g");

      const states = innerG.append("path")
                       .attr("d", path)
                       .style("fill", d => colorDict[genderData[d.properties.name][colorKey]])
                       .style("stroke", "#000")
                       .style("stroke-width", "0.5px");
    });

    const viewBox = `0 0 ${width} ${height}`;
    return <svg
      ref={ref}
      id={id}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      >
      </svg>;
  }


function App() {
    const [genderData, setGenderData] = React.useState({});
    const [topology, setTopology] = React.useState({});
    const [loadingGender, setLoadingGender] = React.useState(true);
    const [loadingTopology, setLoadingTopology] = React.useState(true);

    React.useEffect( () => {
      d3.json("data/gender.json").then(gender => {
        setGenderData(gender); 
        setLoadingGender(false);
      });

      d3.json("data/us-albers.json").then(topology => {
        setTopology(topology);
        setLoadingTopology(false);
      });

      return () => undefined;
    }, []);

    return <> <main>
      <h1>US Gender Marker Map</h1>
      <section>
        <p>Hover a state to view its residents' rights.</p>
        <p>Click on a state to view resources, statutes, policy, court decisions, and more.</p>
        <ul>
          <li>View map for:</li>
          <li><button>nonbinary, driver's license</button></li>
          <li><button>nonbinary, birth certificate</button></li>
          <li><button>binary</button></li>
        </ul>
        {!loadingGender && !loadingTopology && <USMap id="#map" colorKey="x_dl" width="1000" height="600" genderData={genderData} topology={topology}/>}
      </section>
      <footer>
        <h2>I live in <span className="state">$state</span>. Can I...</h2>
        <h3>...change my gender marker to a different binary gender?</h3>
        <h3>...obtain a nonbinary (X) gender marker on my driver's license or state ID?</h3>
        <h3>...obtain a nonbinary (X) gender marker on my birth certificate?</h3>
      </footer>
    </main>

    <footer>
      <h2>You are valid.</h2>
      <p><i>You</i> determine your gender, not your local or federal government. It is reprehensible that the US has not yet nationally recognized the existence of nonbinary genders.</p>
      <p>For peer support, call <a href="">Trans Lifeline</a> or <a href="">Trevor</a>.</p>
    </footer>
    </>;
}

export default App;
