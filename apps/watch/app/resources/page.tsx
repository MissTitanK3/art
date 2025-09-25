import GroupedImmigrantResources from '@/components/GroupedImmigrantResources';
import React from 'react';

const Resources = () => {
  return (
    <div className="m-0 p-0">
      <GroupedImmigrantResources />
      <div className="mt-12 border-t pt-6 text-sm text-gray-400">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Sugerir un Recurso</h2>
          <p>
            ¿Conoces un recurso local o nacional que falta? Escríbenos a{' '}
            <a href="mailto:addresource@peoplesrebellion.org" className="text-blue-400 underline">
              addresource@peoplesrebellion.org
            </a>{' '}
            y lo revisaremos para agregarlo.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Colaboradores</h2>
          <p>
            Este directorio fue recopilado con aportes de organizadores comunitarios, abogados de ayuda legal y redes de
            ayuda mutua en todo Estados Unidos. Un agradecimiento especial a los capítulos estatales de la ACLU,
            coaliciones por los derechos de los inmigrantes y voluntarios que hicieron esto posible.
          </p>
          <p className="mt-2">
            Ver el documento original de colaboradores:&nbsp;
            <a
              href="https://docs.google.com/document/d/1-0r_TmPHhrtUhaoCh1rwsXZ9oASl1RK_kV_oF3nxlD0/mobilebasic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline">
              Guía de Recursos para Inmigrantes Elaborada por la Comunidad (Google Doc)
            </a>
          </p>
        </div>
      </div>

      <div className="mt-12 border-t pt-6 text-sm text-gray-400">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Suggest a Resource</h2>
          <p>
            Know of a local or national resource that’s missing? Email us at{' '}
            <a href="mailto:addresource@peoplesrebellion.org" className="text-blue-400 underline">
              addresource@peoplesrebellion.org
            </a>{' '}
            and we’ll review and add it.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Contributors</h2>
          <p>
            This directory was compiled with input from community organizers, legal aid workers, and mutual aid networks
            across the U.S. Special thanks to the ACLU state chapters, immigrant rights coalitions, and volunteer
            researchers who made this possible.
          </p>
          <p className="mt-2">
            View the original contributor document:&nbsp;
            <a
              href="https://docs.google.com/document/d/1-0r_TmPHhrtUhaoCh1rwsXZ9oASl1RK_kV_oF3nxlD0/mobilebasic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline">
              Community-Sourced Immigrant Resource Guide (Google Doc)
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Resources;
