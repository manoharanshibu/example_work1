import BreadcrumbDropdown from 'app/view/components/breadcrumbs/dropdowns/BreadcrumbDropdown.jsx';

const BreadcrumbDropdownCasino = (props) => {
  const listItems = [
		{ title: 'All Categories', route: 'casino' },
		{ title: 'All Games', route: 'casino/all' },
		{ title: 'Roulette', route: 'casino/roulette' },
		{ title: 'Blackjack', route: 'casino/blackjack' },
		{ title: 'Table', route: 'casino/table' },
		{ title: 'Slots', route: 'casino/slots' },
		{ title: 'Jackpots', route: 'casino/jackpots' },
		{ title: 'Promotions', route: 'casino/promotions' },
  ];

  return (
    <BreadcrumbDropdown
      listItems={listItems}
      {...props}
    />
  );
};

export default BreadcrumbDropdownCasino;
