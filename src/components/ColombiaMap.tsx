import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Map as MapIcon, Info } from 'lucide-react';

const departmentData: Record<string, string> = {
  "BOGOTÁ, D.C.": "La vibrante capital del país y el mayor centro de negocios. Concentra gran parte de la oferta inmobiliaria corporativa y residencial de alto valor, destacando zonas como Chicó, Rosales y el centro histórico.",
  "ANTIOQUIA": "Hogar de la cultura paisa. Medellín se destaca como un hub de innovación tecnológica y turismo, con un mercado inmobiliario en pleno auge, atrayendo nómadas digitales e inversionistas.",
  "VALLE DEL CAUCA": "Polo de desarrollo del suroccidente colombiano. Cali es famosa por su cultura salsera y su fuerte industria azucarera, conectando al país con el pacífico a través del puerto de Buenaventura.",
  "CUNDINAMARCA": "Rodea a la capital y ofrece un mercado de bienes raíces campestres en gran expansión, con hermosos paisajes de la sabana y pueblos coloniales como Villa de Leyva (cercano) y Zipaquirá.",
  "BOLÍVAR": "El epicentro del turismo en Colombia. Cartagena de Indias ofrece inmuebles exclusivos en su Ciudad Amurallada y modernos apartamentos con vista al mar en Bocagrande y Castillogrande.",
  "ATLÁNTICO": "Barranquilla, la 'Puerta de Oro', vive un renacimiento urbano y comercial. Es un punto estratégico para el comercio internacional y la industria inmobiliaria en la costa Caribe.",
  "SANTANDER": "Tierra de imponentes paisajes como el Cañón del Chicamocha. Bucaramanga, la 'Ciudad de los Parques', es reconocida por su excelente calidad de vida y crecimiento inmobiliario ordenado.",
  "MAGDALENA": "Hogar de Santa Marta, la ciudad más antigua de Colombia. Combina la belleza de la Sierra Nevada con el Mar Caribe, atrayendo inversiones para turismo ecológico y residencias de descanso.",
  "QUINDÍO": "El corazón del Eje Cafetero. Con sus paisajes verdes y parques temáticos, es ideal para proyectos de ecoturismo y fincas cafeteras tradicionales.",
  "RISARALDA": "Pereira es un punto de conexión clave en el Eje Cafetero, con un fuerte comercio y proyectos de vivienda moderna impulsados por su estratégica ubicación.",
  "CALDAS": "Manizales, la ciudad de las puertas abiertas, destaca por su ambiente universitario, sus montañas y una oferta de vivienda muy apetecida por su tranquilidad.",
  "TOLIMA": "Ubicado en el centro del país, Ibagué, la 'Capital Musical', sirve como despensa agrícola y punto de conexión clave entre el centro y el occidente del país.",
  "BOYACÁ": "Conocido por su tranquilidad, seguridad y hermosos pueblos históricos. Tunja y sus alrededores ofrecen un estilo de vida apacible y un mercado inmobiliario asequible.",
  "META": "La puerta a los Llanos Orientales. Villavicencio lidera la región en ganadería, agricultura y un creciente mercado de condomiños campestres.",
  "SAN ANDRÉS Y PROVIDENCIA": "Un paraíso caribeño conocido por su 'mar de los siete colores'. Su mercado se centra casi exclusivamente en turismo vacacional y hotelería.",
  "DEFAULT": "Una hermosa región de Colombia con gran riqueza natural, diversidad cultural y excelentes oportunidades emergentes de desarrollo e inversión."
};

function getDepartmentInfo(name?: string) {
  if (!name) return departmentData["DEFAULT"];
  let cleanName = name.toUpperCase().trim();
  if (cleanName === 'BOGOTA' || cleanName === 'SANTAFE DE BOGOTA D.C' || cleanName === 'BOGOTÁ, D. C.') cleanName = 'BOGOTÁ, D.C.';
  return departmentData[cleanName] || departmentData["DEFAULT"];
}

interface ColombiaMapProps {
  activeDepartmentId?: string | null;
  onSelectDepartment?: (deptId: string | null) => void;
  onDepartmentClick?: (deptId: string | null) => void;
  interactive?: boolean;
  compact?: boolean;
}

export function ColombiaMap({ 
  activeDepartmentId, 
  onSelectDepartment, 
  onDepartmentClick, 
  interactive = true, 
  compact = false 
}: ColombiaMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ show: boolean, title: string, desc: string, x: number, y: number }>({
    show: false,
    title: '',
    desc: '',
    x: 0,
    y: 0
  });

  const handleSelection = (dept: string | null) => {
    if (onSelectDepartment) onSelectDepartment(dept);
    if (onDepartmentClick) onDepartmentClick(dept);
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 900;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous rendering

    const g = svg.append("g");
    const projection = d3.geoMercator()
      .center([-74.0, 4.0])
      .scale(3200)
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);
    const geojsonUrl = 'https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/be6a6e239cd5b5b803c6e7c2ec405b793a9064dd/Colombia.geo.json';

    d3.json(geojsonUrl).then((data: any) => {
      setLoading(false);
      if (!data) return;

      g.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", pathGenerator as any)
        .attr("class", "department-path")
        .attr("id", (d: any) => (d.properties.DPTO_CNMBR || "dep").replace(/\s/g, ''))
        .style("fill", "#e2e8f0")
        .style("stroke", "#ffffff")
        .style("stroke-width", "1.5px")
        .style("transition", "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)")
        .style("cursor", "pointer")
        .on("mouseover", function(event, d: any) {
          if (!interactive) return;

          const deptoName = d.properties.DPTO_CNMBR || "Desconocido";
          const info = getDepartmentInfo(deptoName);
          
          setTooltip({
            show: true,
            title: deptoName.charAt(0) + deptoName.slice(1).toLowerCase(),
            desc: info,
            x: event.pageX,
            y: event.pageY
          });

          d3.select(this)
            .style("fill", "#4f46e5")
            .style("stroke", "#312e81")
            .style("stroke-width", "2px")
            .raise();
        })
        .on("mousemove", (event) => {
          if (!interactive) return;
          setTooltip(prev => ({
            ...prev,
            x: event.pageX,
            y: event.pageY
          }));
        })
        .on("mouseout", function() {
          setTooltip(prev => ({ ...prev, show: false }));
          const element = d3.select(this);
          const deptId = element.attr("id");
          
          // Only reset color if it's not the active one
          if (deptId !== (activeDepartmentId || "").replace(/\s/g, '')) {
            element
              .style("fill", "#e2e8f0")
              .style("stroke", "#ffffff")
              .style("stroke-width", "1.5px");
          }
        })
        .on("click", (event, d: any) => {
          if (!interactive) return;
          const deptoName = d.properties.DPTO_CNMBR || null;
          handleSelection(deptoName);
        });

      // Initial highlight if activeDepartmentId is set
      if (activeDepartmentId) {
        g.select(`#${activeDepartmentId.replace(/\s/g, '')}`)
          .style("fill", "#4f46e5")
          .style("stroke", "#312e81")
          .style("stroke-width", "2px")
          .raise();
      }
    }).catch(err => {
      console.error("Error loading map:", err);
      setLoading(false);
    });
  }, [onSelectDepartment, onDepartmentClick, interactive]);

  // Handle prop changes for highlighting
  useEffect(() => {
    if (loading || !svgRef.current) return;
    const g = d3.select(svgRef.current).select("g");
    
    // Reset all
    g.selectAll("path")
      .style("fill", "#e2e8f0")
      .style("stroke", "#ffffff")
      .style("stroke-width", "1.5px");

    // Highlight active
    if (activeDepartmentId) {
      const id = activeDepartmentId.replace(/\s/g, '');
      g.select(`#${id}`)
        .style("fill", "#4f46e5")
        .style("stroke", "#312e81")
        .style("stroke-width", "2px")
        .raise();
    }
  }, [activeDepartmentId, loading]);

  return (
    <div ref={containerRef} className={`relative w-full ${compact ? 'min-h-[300px]' : 'min-h-[400px]'} flex flex-col items-center`}>
      {/* Map Header from the user style - ONLY if NOT compact and is interactive */}
      {!compact && interactive && (
        <div className="w-full text-left mb-8 px-4">
          <div className="mb-4 inline-flex items-center justify-center p-3 bg-indigo-100 rounded-xl w-14 h-14 text-indigo-600">
            <MapIcon className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-slate-900">Explora Colombia</h2>
          <p className="text-slate-600 mb-6 leading-relaxed max-w-md">
            Pasa el cursor sobre cualquier departamento en el croquis para descubrir información clave. 
            Este formato es ideal para visualizar el origen de nuestros tesoros.
          </p>
          
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Instrucciones</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-center"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span> Mueve el mouse sobre el mapa.</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span> Lee la descripción de la región.</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span> El mapa es 100% interactivo.</li>
            </ul>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 animate-pulse">
          <div className={`border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4 ${compact ? 'w-8 h-8' : 'w-12 h-12'}`}></div>
          <p className="text-slate-500 font-medium font-sans text-sm">Trazando...</p>
        </div>
      )}

      <div className={`w-full h-full flex items-center justify-center transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <svg
          ref={svgRef}
          viewBox="0 0 800 900"
          className={`w-full h-auto drop-shadow-2xl ${compact ? 'max-w-[400px]' : 'max-w-[650px]'}`}
          style={{ filter: 'drop-shadow(0 20px 13px rgb(0 0 0 / 0.03))' }}
        />
      </div>

      {/* Tooltip Overlay */}
      {tooltip.show && interactive && (
        <div 
          className="fixed pointer-events-none z-[100] transform -translate-x-1/2 -translate-y-full mt-[-20px] transition-opacity duration-200"
          style={{ 
            left: tooltip.x, 
            top: tooltip.y,
            opacity: tooltip.show ? 1 : 0
          }}
        >
          <div className={`bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-5 ${compact ? 'w-60' : 'w-72'} relative`}>
            {/* Tooltip Arrow */}
            <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-slate-200 rotate-45"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-slate-800">{tooltip.title}</h3>
                {!compact && <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg">Región</span>}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {tooltip.desc}
              </p>
              {!compact && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-400 font-medium gap-1.5">
                  <Info className="w-4 h-4 text-indigo-400" />
                  Haz clic para filtrar región
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
