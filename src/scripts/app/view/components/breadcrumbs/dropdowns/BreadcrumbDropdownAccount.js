import BreadcrumbDropdown from 'app/view/components/breadcrumbs/dropdowns/BreadcrumbDropdown.jsx';

const BreadcrumbDropdownAccount = (props) => {
  let listItems = [];
  if (App.Config.siteId !== 1) {
    listItems = [
			{ title: 'OVERVIEW', route: '/account/overview' },
			{ title: 'WALLET', route: '/deposit/amount' },
			{ title: 'TRANSACTIONS', route: '/transactions' },
			{ title: 'SETTINGS', route: '/account/details' },
    ];
  }

  if (App.Globals.isSportsbookAvailable) { listItems.length && listItems.splice(2, 0, { title: 'MY BETS', route: '/mybets' }); }

  return (
    <BreadcrumbDropdown
      listItems={listItems}
      {...props}
    />
  );
};

export default BreadcrumbDropdownAccount;
