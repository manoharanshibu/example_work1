export default (props) => {
	const errorMessage = props.location.query && props.location.query.errorMessage;

	return (
		<div className="deposit-box">
			<div className="row">
				<div className="inline-element">
					<h3>{App.Intl("deposit.error.title_deposit_not_processed")}</h3>
					<h4>{App.Intl("deposit.error.deposit_not_processed")}</h4>
					{!!errorMessage && <div className="error-box">
						<p>
							{errorMessage}
						</p>
					</div>}
				</div>
			</div>
		</div>
	)
}
