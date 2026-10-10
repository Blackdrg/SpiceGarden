import React from 'react';
import Head from 'next/head';
import type { ErrorProps } from 'next/error';
import errorStyles from './_error.module.css';

export default function Error({ statusCode, title }: ErrorProps) {
  return (
    <>
      <Head>
        <title>{statusCode ? `${statusCode}: ${title || 'Error'}` : 'Error'}</title>
      </Head>
      <div className={errorStyles.root}>
        <h1 className={errorStyles.title}>{statusCode || 'Error'}</h1>
        <h2 className={errorStyles.subtitle}>
          {statusCode === 404 ? 'This page could not be found' : title || 'Internal Server Error'}
        </h2>
        <p className={errorStyles.description}>
          {statusCode === 404
            ? 'Please check the URL in the address bar and try again.'
            : 'Our team has been notified and is working on a fix.'}
        </p>
      </div>
    </>
  );
}
