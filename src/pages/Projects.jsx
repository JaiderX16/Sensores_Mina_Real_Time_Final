import React from 'react';

const Projects = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and monitor your ongoing projects.</p>
        </div>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          + New Project
        </button>
      </div>
      
    </div>
  );
};

export default Projects;