import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/history',
      permanent: false,
    },
  };
};

const OrdersRedirect = () => null;

export default OrdersRedirect;
